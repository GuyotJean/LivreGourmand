import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOuvrage } from '../services/ouvrageService'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getOuvrage(id)
        setProduct(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return (
    <div className="container">
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    </div>
  )
  
  if (!product) return <div className="container"><div className="alert alert-danger">Ouvrage non trouvé</div></div>

  // Calculer la moyenne des avis
  const avis = product.avis || []
  const moyenneAvis = avis.length > 0
    ? (avis.reduce((sum, a) => sum + (a.note || 0), 0) / avis.length).toFixed(1)
    : null

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.stock) {
      addItem(product, quantity)
      alert(`${quantity} exemplaire(s) ajouté(s) au panier`)
    } else {
      alert('Quantité invalide')
    }
  }

  return (
    <div className="container">
      <h2 className="mb-4">Description d'un ouvrage</h2>
      
      <div className="row g-4">
        <div className="col-md-5">
          <img 
            src={product.image || '/placeholder.png'} 
            alt={product.titre} 
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px', objectFit: 'cover', width: '100%' }}
          />
        </div>
        
        <div className="col-md-7">
          <h1 className="mb-3">{product.titre}</h1>
          
          {product.auteur && (
            <p className="text-muted mb-2"><strong>Auteur:</strong> {product.auteur}</p>
          )}
          
          {product.categorie && (
            <p className="mb-2">
              <strong>Catégories:</strong> {product.categorie.nom || product.categorie}
            </p>
          )}
          
          {moyenneAvis && (
            <div className="mb-3">
              <strong>Avis moyen:</strong> {moyenneAvis}/5 
              <span className="text-muted ms-2">({avis.length} avis)</span>
            </div>
          )}

          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Informations</h5>
              <table className="table table-borderless mb-0">
                <tbody>
                  {product.isbn && (
                    <tr>
                      <td><strong>ISBN:</strong></td>
                      <td>{product.isbn}</td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Prix:</strong></td>
                    <td><h4 className="text-primary mb-0">{Number(product.prix ?? 0).toFixed(2)} €</h4></td>
                  </tr>
                  <tr>
                    <td><strong>Stock:</strong></td>
                    <td>
                      {product.stock > 0 ? (
                        <span className="badge bg-success">{product.stock} disponible(s)</span>
                      ) : (
                        <span className="badge bg-danger">Épuisé</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {product.description && (
            <div className="mb-3">
              <h5>Description</h5>
              <p className="text-muted">{product.description}</p>
            </div>
          )}

          <div className="card p-3 mb-3">
            <div className="d-flex align-items-center gap-3">
              <div>
                <label className="form-label mb-0"><strong>Quantité</strong></label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="form-control"
                  style={{ width: '100px' }}
                />
              </div>
              <div className="flex-grow-1">
                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? 'AJOUTER AU PANIER' : 'ÉPUISÉ'}
                </button>
              </div>
            </div>
          </div>

          {/* Avis */}
          {avis.length > 0 && (
            <div className="mt-4">
              <h5>Avis des utilisateurs ({avis.length})</h5>
              <div className="list-group">
                {avis.map(a => (
                  <div key={a.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{a.client_nom || 'Anonyme'}</strong>
                        <span className="badge bg-warning text-dark ms-2">{a.note}/5</span>
                      </div>
                      {a.date && (
                        <small className="text-muted">{new Date(a.date).toLocaleDateString()}</small>
                      )}
                    </div>
                    {a.commentaire && (
                      <p className="mb-0 mt-2">{a.commentaire}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaires - se existir no backend */}
          {product.commentaires && product.commentaires.length > 0 && (
            <div className="mt-4">
              <h5>Commentaires ({product.commentaires.length})</h5>
              <div className="list-group">
                {product.commentaires.map(c => (
                  <div key={c.id} className="list-group-item">
                    <p className="mb-0">{c.contenu}</p>
                    {c.client_nom && (
                      <small className="text-muted">— {c.client_nom}</small>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
