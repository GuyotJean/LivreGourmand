import express from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import { validateMessage } from "../validators/chat.validator.js";

const router = express.Router();

/**
 * POST /chat
 * Envoie un message au chatbot et retourne la réponse
 */
router.post("/", validateMessage, sendMessage);

export default router;
