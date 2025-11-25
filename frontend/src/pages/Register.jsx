import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register() {
  const { signup } = useContext(AuthContext)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Valider que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    try {
      setLoading(true)
      await signup(nom, prenom, email, password)
      nav('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de l\'enregistrement')
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
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Nom (*)</label>
              <input 
                className="form-control" 
                value={nom} 
                onChange={e => setNom(e.target.value)} 
                placeholder="Votre nom de famille"
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Prénom (*)</label>
              <input 
                className="form-control" 
                value={prenom} 
                onChange={e => setPrenom(e.target.value)} 
                placeholder="Votre prénom"
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
                minLength={6}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmer le mot de passe (*)</label>
              <input 
                type="password" 
                className="form-control" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Répétez le mot de passe"
                required 
                minLength={6}
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

