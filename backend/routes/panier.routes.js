import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  getPanier,
  addItem,
  updateItem,
  removeItem,
} from "../controllers/panier.controller.js";

const router = express.Router();

// Récupérer le panier actuel
router.get("/", verifyToken, getPanier);

// Ajouter un item
router.post("/items", verifyToken, addItem);

// Modifier un item
router.put("/items/:id", verifyToken, updateItem);

// Retirer un item
router.delete("/items/:id", verifyToken, removeItem);

export default router;
