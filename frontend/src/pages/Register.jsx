import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register() {
  const { signup } = useContext(AuthContext)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await signup(nom, email, password)
      nav('/')
    } catch (err) {
      alert(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h2 className="mb-4">Enregistrement sur le site</h2>
          <p className="text-muted mb-3">(champs obligatoires avec astérisque *)</p>
          <form onSubmit={handleSubmit} className="card p-4">
            <div className="mb-3">
              <label className="form-label">Nom (*)</label>
              <input 
                className="form-control" 
                value={nom} 
                onChange={e => setNom(e.target.value)} 
                placeholder="Votre nom"
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email (*)</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="votre@email.com"
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe (*)</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Minimum 6 caractères"
                required 
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <div className="mt-3 text-center">
              <p className="mb-0">
                Déjà un compte ? <Link to="/login">Connexion</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

