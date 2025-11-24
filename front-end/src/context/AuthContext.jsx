import React, { createContext, useEffect, useState } from 'react'
import { login as svcLogin, getMe } from '../services/authService'
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

  // initialize user from token if present
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      // try fetch /users/me
      (async () => {
        try {
          setLoading(true)
          const me = await getMe()
          setUser(me)
        } catch (e) {
          // token invalid
          localStorage.removeItem('token')
          setUser(null)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [])

  const signin = async (email, password) => {
    const data = await svcLogin(email, password) // { token }
    if (data.token) {
      localStorage.setItem('token', data.token)
      // fetch profile
      const me = await getMe()
      setUser(me)
    }
  }

  const signout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signin, signout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
