import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * 🛒 GET /api/panier — récupérer le panier actuel du client connecté
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT p.id, p.titre, pi.quantite, p.prix, (p.prix * pi.quantite) AS total
       FROM panier_items pi
       JOIN ouvrages p ON pi.ouvrage_id = p.id
       WHERE pi.user_id = ?`,
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * ➕ POST /api/panier/items — ajouter un item au panier
 * { ouvrage_id, quantite }
 */
router.post('/items', verifyToken, async (req, res) => {
  const { ouvrage_id, quantite } = req.body;
  try {
    // Vérifier si l'article est déjà dans le panier
    const [exist] = await db.query(
      `SELECT id, quantite FROM panier_items WHERE user_id = ? AND ouvrage_id = ?`,
      [req.user.id, ouvrage_id]
    );

    if (exist.length > 0) {
      // Mettre à jour la quantité
      await db.query(
        `UPDATE panier_items SET quantite = quantite + ? WHERE id = ?`,
        [quantite, exist[0].id]
      );
    } else {
      // Ajouter un nouvel item
      await db.query(
        `INSERT INTO panier_items (user_id, ouvrage_id, quantite) VALUES (?, ?, ?)`,
        [req.user.id, ouvrage_id, quantite]
      );
    }
    res.status(201).json({ message: 'Article ajouté au panier' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * ✏️ PUT /api/panier/items/:id — modifier la quantité d'un item
 */
router.put('/items/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;
  try {
    await db.query(
      `UPDATE panier_items SET quantite = ? WHERE id = ? AND user_id = ?`,
      [quantite, id, req.user.id]
    );
    res.json({ message: 'Quantité mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * ❌ DELETE /api/panier/items/:id — retirer un item du panier
 */
router.delete('/items/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM panier_items WHERE id = ? AND user_id = ?`, [id, req.user.id]);
    res.json({ message: 'Article retiré du panier' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
