import Stripe from 'stripe';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Stripe com a chave secreta (ou usar uma chave de teste por padrão)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Criar PaymentIntent do Stripe
 */
export const createPaymentIntent = async (req, res) => {
  const { commandeId } = req.body;
  const clientId = req.user.id;

  try {
    // Verificar se a commande existe e pertence ao cliente
    const [commandeRows] = await db.query(
      `SELECT id, total, statut FROM commandes WHERE id = ? AND client_id = ?`,
      [commandeId, clientId]
    );

    if (commandeRows.length === 0) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    const commande = commandeRows[0];

    if (commande.statut !== 'en_cours') {
      return res.status(400).json({ message: 'Commande déjà traitée' });
    }

    // Converter o total para centavos (Stripe usa centavos)
    const amountInCents = Math.round(commande.total * 100);

    // Criar PaymentIntent no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'cad',
      metadata: {
        commande_id: commandeId.toString(),
        client_id: clientId.toString(),
      },
    });

    // Salvar o payment_intent_id na tabela payments
    await db.query(
      `INSERT INTO payments (commande_id, provider, provider_payment_id, statut, amount)
       VALUES (?, 'stripe', ?, 'pending', ?)`,
      [commandeId, paymentIntent.id, commande.total]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Erreur Stripe:', err);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erreur lors de la création du paiement';
    if (err.type === 'StripeInvalidRequestError') {
      errorMessage = 'Clé Stripe invalide. Vérifiez STRIPE_SECRET_KEY dans le fichier .env du backend.';
    } else if (err.message?.includes('No API key')) {
      errorMessage = 'Clé Stripe non configurée. Ajoutez STRIPE_SECRET_KEY dans le fichier .env du backend.';
    } else {
      errorMessage = err.message || errorMessage;
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: err.message,
      type: err.type 
    });
  }
};

/**
 * Confirmar pagamento após sucesso no Stripe
 */
export const confirmPayment = async (req, res) => {
  const { paymentIntentId, commandeId } = req.body;
  const clientId = req.user.id;

  try {
    // Verificar se a commande pertence ao cliente
    const [commandeRows] = await db.query(
      `SELECT id, statut FROM commandes WHERE id = ? AND client_id = ?`,
      [commandeId, clientId]
    );

    if (commandeRows.length === 0) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Verificar o status do PaymentIntent no Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Atualizar o status da commande
      await db.query(
        `UPDATE commandes SET statut = 'payee', payment_provider_id = ? WHERE id = ?`,
        [paymentIntentId, commandeId]
      );

      // Atualizar o status do pagamento
      await db.query(
        `UPDATE payments SET statut = 'succeeded' WHERE provider_payment_id = ?`,
        [paymentIntentId]
      );

      // Limpar o panier após pagamento confirmado
      const [panierRows] = await db.query(
        `SELECT id FROM panier WHERE client_id = ? AND actif = 1`,
        [clientId]
      );
      if (panierRows.length > 0) {
        const panierId = panierRows[0].id;
        await db.query(`DELETE FROM panier_items WHERE panier_id = ?`, [panierId]);
      }

      res.json({ message: 'Paiement confirmé avec succès', commandeId });
    } else {
      res.status(400).json({ message: 'Paiement non réussi', status: paymentIntent.status });
    }
  } catch (err) {
    console.error('Erreur confirmation paiement:', err);
    res.status(500).json({ message: 'Erreur lors de la confirmation du paiement', error: err.message });
  }
};

/**
 * Webhook do Stripe (para receber eventos do Stripe)
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Erreur webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements Stripe
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const commandeId = paymentIntent.metadata.commande_id;
    const clientId = paymentIntent.metadata.client_id;

    try {
      await db.query(
        `UPDATE commandes SET statut = 'payee', payment_provider_id = ? WHERE id = ?`,
        [paymentIntent.id, commandeId]
      );

      await db.query(
        `UPDATE payments SET statut = 'succeeded' WHERE provider_payment_id = ?`,
        [paymentIntent.id]
      );

      // Limpar o panier após pagamento confirmado
      const [panierRows] = await db.query(
        `SELECT id FROM panier WHERE client_id = ? AND actif = 1`,
        [clientId]
      );
      if (panierRows.length > 0) {
        const panierId = panierRows[0].id;
        await db.query(`DELETE FROM panier_items WHERE panier_id = ?`, [panierId]);
      }
    } catch (err) {
      console.error('Erreur mise à jour commande via webhook:', err);
    }
  }

  res.json({ received: true });
};

