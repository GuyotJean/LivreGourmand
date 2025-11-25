import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Webhook do Stripe (não precisa de autenticação, usa assinatura)
// Nota: o express.raw() é aplicado no app.js antes do express.json()
router.post('/webhook', stripeWebhook);

// Criar PaymentIntent (requer autenticação)
router.post('/create-payment-intent', verifyToken, createPaymentIntent);

// Confirmar pagamento (requer autenticação)
router.post('/confirm', verifyToken, confirmPayment);

export default router;

