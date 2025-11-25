import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCommandeById } from '../services/commandeService'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getCommandeById(id) // per controller returns { commande, items }
        setOrder(data.commande || data)
        setItems(data.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="container">Loading...</div>
  if (!order) return <div className="container">Order not found</div>

  return (
    <div className="container">
      <h2>Order #{order.id}</h2>
      <p>Status: <strong>{order.statut}</strong></p>
      <p>Created: {new Date(order.created_at).toLocaleString()}</p>

      <h5>Items</h5>
      <ul className="list-group">
        {items.map(it => (
          <li key={it.id} className="list-group-item d-flex justify-content-between">
            <div>{it.titre || it.title}</div>
            <div>{it.quantite} × {Number(it.prix_unitaire ?? it.price ?? 0).toFixed(2)} €</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
