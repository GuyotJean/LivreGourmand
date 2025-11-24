import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOuvrage } from '../services/ouvrageService'
import { CartContext } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addItem } = useContext(CartContext)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getOuvrage(id) // controller returns { ...ouvrage, avis: [...] }
        setProduct(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="container">Loading...</div>
  if (!product) return <div className="container">Book not found</div>

  return (
    <div className="container">
      <div className="row g-4">
        <div className="col-md-5">
          <img src={product.image || '/placeholder.png'} alt={product.titre} className="img-fluid" />
        </div>
        <div className="col-md-7">
          <h2>{product.titre}</h2>
          <p className="text-muted">Author: {product.auteur}</p>
          <h4>{Number(product.prix ?? 0).toFixed(2)} €</h4>
          <p>{product.description}</p>
          <p>Stock: {product.stock ?? '—'}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => addItem(product, 1)}>Add to cart</button>
          </div>

          {/* reviews if present */}
          {product.avis && product.avis.length > 0 && (
            <div className="mt-4">
              <h5>Reviews</h5>
              {product.avis.map(a => (
                <div key={a.id} className="border p-2 mb-2">
                  <strong>{a.client_nom}</strong> — {a.note}/5
                  <p>{a.commentaire}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
