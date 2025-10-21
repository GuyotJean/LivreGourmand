import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import {
  createCommande,
  getCommandes,
  getCommandeById,
  updateCommandeStatus,
} from "../controllers/commandes.controller.js";

const router = express.Router();

// Créer une commande depuis le panier
router.post("/", verifyToken, createCommande);

// Historique client
router.get("/", verifyToken, getCommandes);

// Détail d'une commande (client ou admin)
router.get("/:id", verifyToken, getCommandeById);

// Mise à jour du statut (admin/gestionnaire)
router.put(
  "/:id/status",
  verifyToken,
  authorizeRole(["administrateur", "gestionnaire"]),
  updateCommandeStatus
);

export default router;
