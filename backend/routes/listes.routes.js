import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createListe,
  getListeByCode,
  acheterDepuisListe,
} from "../controllers/listes.controller.js";

const router = express.Router();

// Créer une liste et ajouter des items
router.post("/", verifyToken, createListe);

// Consulter une liste par code
router.get("/:code", verifyToken, getListeByCode);

// Acheter directement depuis une liste
router.post("/:code", verifyToken, acheterDepuisListe);

export default router;
