import api from '../api/axiosInstance'

export const createCommande = async (payload) => {
  // payload per controller is created from panier server-side,
  // but we call POST /commandes to create a commande.
  const res = await api.post('/commandes', payload)
  return res.data
}

export const listCommandes = async () => {
  const res = await api.get('/commandes')
  return res.data
}

export const getCommandeById = async (id) => {
  const res = await api.get(`/commandes/${id}`)
  return res.data
}
