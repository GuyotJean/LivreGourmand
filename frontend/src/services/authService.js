import api from '../api/axiosInstance'

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data // { token } selon votre contrôleur
}

export const register = async (nom, prenom, email, password) => {
  const res = await api.post('/auth/register', { nom, prenom, email, password })
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/users/me')
  return res.data
}
