import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

export default function Header() {
  const { items } = useContext(CartContext)
  const { user, signout } = useContext(AuthContext)
  const count = items.reduce((s, i) => s + (i.qty || 0), 0)

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/">Bookstore</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">Home</NavLink>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item me-3">
              <NavLink to="/cart" className="nav-link">Cart <span className="badge bg-primary">{count}</span></NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item me-2"><span className="nav-link">Hi, {user.nom ?? user.email}</span></li>
                <li className="nav-item"><button className="btn btn-outline-secondary" onClick={signout}>Logout</button></li>
              </>
            ) : (
              <li className="nav-item"><NavLink to="/login" className="btn btn-primary">Login</NavLink></li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
