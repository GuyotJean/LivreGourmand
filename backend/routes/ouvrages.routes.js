import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

/**
 * 📌 GET /api/ouvrages
 * Liste des ouvrages avec filtres (texte, catégorie, popularité)
 * Ex: /api/ouvrages?search=chocolat&categorie=2&order=popularite
 */
router.get('/', async (req, res) => {
  try {
    const { search, categorie, order } = req.query;

    let query = `
      SELECT o.*, 
             IFNULL(AVG(a.note), 0) AS moyenne_note,
             COUNT(a.id) AS nb_avis
      FROM ouvrages o
      LEFT JOIN avis a ON a.ouvrage_id = o.id
    `;
    let conditions = [];
    let params = [];

    if (search) {
      conditions.push(`(o.titre LIKE ? OR o.auteur LIKE ? OR o.description LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (categorie) {
      conditions.push(`o.categorie_id = ?`);
      params.push(categorie);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY o.id`;

    if (order === 'popularite') {
      query += ` ORDER BY nb_avis DESC`;
    } else {
      query += ` ORDER BY o.created_at DESC`;
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 📌 GET /api/ouvrages/:id — détail (incl. avis validés)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [ouvrage] = await db.query(
      `SELECT o.*, 
              IFNULL(AVG(a.note), 0) AS moyenne_note,
              COUNT(a.id) AS nb_avis
       FROM ouvrages o
       LEFT JOIN avis a ON a.ouvrage_id = o.id
       WHERE o.id = ?
       GROUP BY o.id`,
      [id]
    );

    if (ouvrage.length === 0) return res.status(404).json({ message: 'Ouvrage non trouvé' });

    const [avis] = await db.query(
      `SELECT a.*, u.nom AS client_nom
       FROM avis a
       JOIN users u ON u.id = a.client_id
       WHERE a.ouvrage_id = ?`,
      [id]
    );

    res.json({ ...ouvrage[0], avis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 📌 POST /api/ouvrages — création (role: editeur/gestionnaire)
 */
router.post('/', verifyToken, authorizeRole(['editeur', 'gestionnaire']), async (req, res) => {
  try {
    const { titre, auteur, isbn, description, prix, stock, categorie_id } = req.body;

    const [result] = await db.query(
      `INSERT INTO ouvrages (titre, auteur, isbn, description, prix, stock, categorie_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titre, auteur, isbn, description, prix, stock, categorie_id]
    );

    res.status(201).json({ message: 'Ouvrage créé', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 📌 PUT /api/ouvrages/:id — update
 */
router.put('/:id', verifyToken, authorizeRole(['editeur', 'gestionnaire']), async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, auteur, isbn, description, prix, stock, categorie_id } = req.body;

    await db.query(
      `UPDATE ouvrages 
       SET titre = ?, auteur = ?, isbn = ?, description = ?, prix = ?, stock = ?, categorie_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [titre, auteur, isbn, description, prix, stock, categorie_id, id]
    );

    res.json({ message: 'Ouvrage mis à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 📌 DELETE /api/ouvrages/:id — delete
 */
router.delete('/:id', verifyToken, authorizeRole(['editeur', 'gestionnaire']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM ouvrages WHERE id = ?`, [id]);
    res.json({ message: 'Ouvrage supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
