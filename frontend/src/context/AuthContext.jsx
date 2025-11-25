import React, { createContext, useEffect, useState } from 'react'
import { login as svcLogin, register as svcRegister, getMe } from '../services/authService'
import api from '../api/axiosInstance'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  // Initialiser l'utilisateur à partir du token s'il est présent
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      // Essayer de récupérer /users/me
      (async () => {
        try {
          setLoading(true)
          const me = await getMe()
          setUser(me)
        } catch (e) {
          // Token invalide
          localStorage.removeItem('token')
          setUser(null)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [])

  const signin = async (email, password) => {
    const data = await svcLogin(email, password) // { token } selon votre contrôleur
    if (data.token) {
      localStorage.setItem('token', data.token)
      // Récupérer le profil
      const me = await getMe()
      setUser(me)
    }
  }

  const signup = async (nom, prenom, email, password) => {
    await svcRegister(nom, prenom, email, password)
    // Après l'enregistrement, connexion automatique
    await signin(email, password)
  }

  const signout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signin, signup, signout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
