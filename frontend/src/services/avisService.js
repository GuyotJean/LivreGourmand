import api from '../api/axiosInstance'

export const addAvis = async (ouvrageId, note, commentaire) => {
  const res = await api.post(`/ouvrages/${ouvrageId}/avis`, { note, commentaire })
  return res.data
}

