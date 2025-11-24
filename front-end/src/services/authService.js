import api from '../api/axiosInstance'

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data // { token } per your controller
}

export const register = async (nom, email, password) => {
  const res = await api.post('/auth/register', { nom, email, password })
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/users/me')
  return res.data
}
