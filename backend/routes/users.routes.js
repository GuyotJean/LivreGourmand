import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { getMe, updateUser, getUsers } from "../controllers/users.controller.js";

const router = express.Router();

// Profil connecté
router.get("/me", verifyToken, getMe);

// Modifier un utilisateur
router.put("/:id", verifyToken, updateUser);

// Liste des utilisateurs (admin)
router.get("/", verifyToken, authorizeRole(["administrateur"]), getUsers);

export default router;
