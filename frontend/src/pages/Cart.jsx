import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'

export default function Cart() {
  const { items, changeQty, remove, total } = useContext(CartContext)
  const nav = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container">
        <h2 className="mb-4">Panier</h2>
        <div className="alert alert-info">
          <p className="mb-0">Votre panier est vide.</p>
        </div>
        <Link to="/" className="btn btn-outline-primary">Continuer les achats</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h2 className="mb-4">Panier</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Titre de l'ouvrage</th>
                  <th>Quantité</th>
                  <th>Montant TTC</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={i.image || '/placeholder.png'} 
                          alt={i.title} 
                          style={{ width: 60, height: 80, objectFit: 'cover', marginRight: '15px' }}
                          className="rounded"
                        />
                        <strong>{i.title}</strong>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        value={i.qty} 
                        onChange={e => changeQty(i.id, Number(e.target.value))} 
                        style={{ width: '80px' }} 
                        className="form-control" 
                      />
                    </td>
                    <td>
                      <strong>{(i.price * i.qty).toFixed(2)} €</strong>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => remove(i.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="text-end"><strong>Total TTC</strong></td>
                  <td colSpan="2"><strong>{total.toFixed(2)} €</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h5>Résumé</h5>
            <p className="mb-2">Total TTC: <strong className="text-primary fs-4">{total.toFixed(2)} €</strong></p>
            <button 
              className="btn btn-success w-100 btn-lg" 
              onClick={() => nav('/checkout')}
              disabled={items.length === 0}
            >
              Passer la commande
            </button>
            <Link to="/" className="btn btn-outline-secondary w-100 mt-2">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
