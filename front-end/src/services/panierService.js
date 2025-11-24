import api from '../api/axiosInstance'

export const fetchPanier = async () => {
  const res = await api.get('/panier')
  return res.data
}

export const addPanierItem = async (ouvrage_id, quantite = 1) => {
  const res = await api.post('/panier', { ouvrage_id, quantite })
  return res.data
}

export const updatePanierItem = async (id, quantite) => {
  const res = await api.put(`/panier/${id}`, { quantite })
  return res.data
}

export const removePanierItem = async (id) => {
  const res = await api.delete(`/panier/${id}`)
  return res.data
}
