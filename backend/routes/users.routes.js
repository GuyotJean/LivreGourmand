import express from 'express';
import { db } from '../db.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
const router = express.Router();

// 👤 GET /me — profil connecté
router.get('/me', verifyToken, async (req, res) => {
  const [rows] = await db.query('SELECT id, nom, email, role, actif, created_at FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(rows[0]);
});

// ✍️ PUT /:id — modifier utilisateur
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nom, actif } = req.body;

  // seul admin ou propriétaire
  if (req.user.role !== 'administrateur' && req.user.id != id) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  await db.query('UPDATE users SET nom = ?, actif = ? WHERE id = ?', [nom, actif, id]);
  res.json({ message: 'Utilisateur mis à jour' });
});

// 👑 GET / — liste des utilisateurs (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT id, nom, email, role, actif, created_at FROM users');
  res.json(rows);
});

export default router;
