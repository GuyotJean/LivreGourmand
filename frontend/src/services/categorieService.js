import api from '../api/axiosInstance'

export const listCategories = async () => {
  const res = await api.get('/categories')
  return res.data
}

