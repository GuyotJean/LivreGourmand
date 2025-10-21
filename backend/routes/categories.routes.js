import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller.js';

const router = express.Router();

// GET /api/categories
router.get('/', getAllCategories);

// POST /api/categories
router.post(
  '/',
  verifyToken,
  authorizeRole(['editeur', 'gestionnaire', 'administrateur']),
  createCategory
);

// PUT /api/categories/:id
router.put(
  '/:id',
  verifyToken,
  authorizeRole(['editeur', 'gestionnaire', 'administrateur']),
  updateCategory
);

// DELETE /api/categories/:id
router.delete(
  '/:id',
  verifyToken,
  authorizeRole(['editeur', 'gestionnaire', 'administrateur']),
  deleteCategory
);

export default router;
