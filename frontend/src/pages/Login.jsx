import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const { signin } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await signin(email, password)
      nav('/')
    } catch (err) {
      alert(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h2 className="mb-4">Connexion</h2>
          <form onSubmit={handleSubmit} className="card p-4">
            <div className="mb-3">
              <label className="form-label">Login</label>
              <input 
                type="email"
                className="form-control" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Votre email"
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Votre mot de passe"
                required 
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Connexion'}
            </button>
            <div className="mt-3 text-center">
              <Link to="/register" className="text-decoration-none">S'enregistrer</Link>
              <span className="mx-2">|</span>
              <Link to="#" className="text-decoration-none">Mot de passe oublié</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
