import React, { useEffect, useState } from 'react'
import { listCommandes } from '../services/commandeService'
import { Link } from 'react-router-dom'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await listCommandes()
        setOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="container">
      <h2>Your Orders</h2>
      {loading ? <div>Loading...</div> : (
        <>
          {orders.length === 0 && <p>No orders yet.</p>}
          <ul className="list-group">
            {orders.map(o => (
              <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Order #{o.id}</strong><br/>
                  <small>{new Date(o.created_at).toLocaleString()}</small>
                </div>
                <div>
                  <span className="badge bg-secondary me-2">{o.statut}</span>
                  <Link to={`/commandes/${o.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
