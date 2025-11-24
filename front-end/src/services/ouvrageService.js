import api from '../api/axiosInstance'

export const listOuvrages = async (params = {}) => {
  // supports search, categorie, order per controller
  const res = await api.get('/ouvrages', { params })
  return res.data
}

export const getOuvrage = async (id) => {
  const res = await api.get(`/ouvrages/${id}`)
  return res.data
}
