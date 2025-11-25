import api from '../api/axiosInstance'

export const createPaymentIntent = async (commandeId) => {
  const res = await api.post('/payment/create-payment-intent', { commandeId })
  return res.data
}

export const confirmPayment = async (paymentIntentId, commandeId) => {
  const res = await api.post('/payment/confirm', { paymentIntentId, commandeId })
  return res.data
}

