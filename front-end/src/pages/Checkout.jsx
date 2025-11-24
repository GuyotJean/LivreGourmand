import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { createCommande } from '../services/commandeService'

export default function Checkout() {
  const { total, clear } = useContext(CartContext)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleCheckout = async () => {
    try {
      setLoading(true)
      // backend builds commande from panier; no items payload required per your controller
      const res = await createCommande({})
      // response contains { commandeId, paymentUrl } per controller
      alert('Order created. You will be redirected to payment (simulation).')
      if (res.paymentUrl) window.location.href = res.paymentUrl
      clear()
      nav('/commandes')
    } catch (e) {
      alert(e?.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Checkout</h2>
      <p>Total: <strong>{total.toFixed(2)} €</strong></p>
      <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing...' : 'Pay & Create order'}
      </button>
    </div>
  )
}
