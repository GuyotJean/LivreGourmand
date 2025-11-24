import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'

export default function Cart() {
  const { items, changeQty, remove, total } = useContext(CartContext)
  const nav = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container">
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
        <Link to="/" className="btn btn-outline-primary">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Your Cart</h2>
      <div className="row">
        <div className="col-md-8">
          <ul className="list-group mb-3">
            {items.map(i => (
              <li key={i.id} className="list-group-item d-flex align-items-center">
                <img src={i.image || '/placeholder.png'} alt={i.title} style={{ width: 80, height: 100, objectFit: 'cover' }} />
                <div className="ms-3 me-auto">
                  <h6>{i.title}</h6>
                  <div className="d-flex align-items-center mt-2">
                    <input type="number" min="1" value={i.qty} onChange={e => changeQty(i.id, Number(e.target.value))} style={{ width: 80 }} className="form-control me-2" />
                    <button className="btn btn-sm btn-danger" onClick={() => remove(i.id)}>Remove</button>
                  </div>
                </div>
                <div>
                  <strong>{(i.price * i.qty).toFixed(2)} €</strong>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h5>Summary</h5>
            <p>Total: <strong>{total.toFixed(2)} €</strong></p>
            <button className="btn btn-success w-100" onClick={() => nav('/checkout')}>Checkout</button>
          </div>
        </div>
      </div>
    </div>
  )
}
