import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';  // ✅ Corrigé ici

const router = express.Router();

/**
 * 🧾 POST /api/commandes — créer une commande
 * Simulation de paiement : renvoie une fausse URL de paiement
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    // Récupérer les items du panier
    const [items] = await db.query(
      `SELECT ouvrage_id, quantite FROM panier_items WHERE user_id = ?`,
      [req.user.id]
    );

    if (items.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    // Créer la commande
    const [commandeResult] = await db.query(
      `INSERT INTO commandes (user_id, status, created_at) VALUES (?, 'en_attente', NOW())`,
      [req.user.id]
    );
    const commandeId = commandeResult.insertId;

    // Ajouter les lignes de commande
    for (const item of items) {
      await db.query(
        `INSERT INTO commande_items (commande_id, ouvrage_id, quantite) VALUES (?, ?, ?)`,
        [commandeId, item.ouvrage_id, item.quantite]
      );
    }

    // Vider le panier
    await db.query(`DELETE FROM panier_items WHERE user_id = ?`, [req.user.id]);

    // Retour URL de paiement simulée
    const paymentUrl = `https://paiement.simulation.com/commande/${commandeId}`;
    res.status(201).json({ message: 'Commande créée', commandeId, paymentUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 📜 GET /api/commandes — historique client
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const [commandes] = await db.query(
      `SELECT * FROM commandes WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(commandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 📄 GET /api/commandes/:id — détail d'une commande (client ou admin)
 */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier que c'est l'admin ou le propriétaire
    const [commande] = await db.query(`SELECT * FROM commandes WHERE id = ?`, [id]);
    if (commande.length === 0) return res.status(404).json({ message: 'Commande introuvable' });

    if (req.user.role !== 'administrateur' && commande[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const [items] = await db.query(
      `SELECT ci.quantite, o.titre, o.prix FROM commande_items ci
       JOIN ouvrages o ON ci.ouvrage_id = o.id
       WHERE ci.commande_id = ?`,
      [id]
    );

    res.json({ commande: commande[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * 🛠️ PUT /api/commandes/:id/status — mise à jour du statut (admin ou gestionnaire)
 * { status: 'en_cours' | 'envoyée' | 'livrée' | ... }
 */
router.put('/:id/status', verifyToken, authorizeRole(['administrateur', 'gestionnaire']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query(`UPDATE commandes SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
