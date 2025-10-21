import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import {
  getOuvrages,
  getOuvrageById,
  createOuvrage,
  updateOuvrage,
  deleteOuvrage,
  addAvis,
} from "../controllers/ouvrages.controller.js";

const router = express.Router();

// Routes publiques
router.get("/", getOuvrages);
router.get("/:id", getOuvrageById);

// Routes protégées
router.post("/", verifyToken, authorizeRole(["editeur", "gestionnaire", "administrateur"]), createOuvrage);
router.put("/:id", verifyToken, authorizeRole(["editeur", "gestionnaire", "administrateur"]), updateOuvrage);
router.delete("/:id", verifyToken, authorizeRole(["editeur", "gestionnaire", "administrateur"]), deleteOuvrage);

// Ajouter un avis
router.post("/:id/avis", verifyToken, addAvis);

export default router;
