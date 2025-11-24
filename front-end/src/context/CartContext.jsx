import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  fetchPanier,
  addPanierItem,
  updatePanierItem,
  removePanierItem
} from '../services/panierService'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : []
  })
  const [loading, setLoading] = useState(false)

  // persist local cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // when user logs in, try to load server cart and merge
  useEffect(() => {
    if (user) {
      (async () => {
        try {
          setLoading(true)
          const serverItems = await fetchPanier() // returns array of items with panier_item_id, ouvrage_id, titre, quantite, prix_unitaire, total
          // map server items to our product shape
          const mapped = serverItems.map(si => ({
            id: si.ouvrage_id,
            panierItemId: si.panier_item_id,
            title: si.titre,
            qty: si.quantite,
            price: Number(si.prix_unitaire),
            image: si.image || null
          }))
          // strategy: prefer server state (authoritative). If server empty keep local.
          if (mapped.length > 0) setItems(mapped)
        } catch (e) {
          console.warn('Failed to fetch server cart', e)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [user])

  const addItem = async (product, qty = 1) => {
    // optimistic local update
    setItems(prev => {
      const ex = prev.find(p => p.id === product.id)
      if (ex) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qty } : p)
      return [...prev, { id: product.id, title: product.titre || product.title, qty, price: Number(product.prix ?? product.price ?? 0), image: product.image || null }]
    })

    // if logged, call server to add (backend handles stock checks and returns message)
    if (user) {
      try {
        await addPanierItem(product.id, qty)
        // after server add, refresh panier to get panier_item_id etc
        const serverItems = await fetchPanier()
        const mapped = serverItems.map(si => ({
          id: si.ouvrage_id,
          panierItemId: si.panier_item_id,
          title: si.titre,
          qty: si.quantite,
          price: Number(si.prix_unitaire),
          image: si.image || null
        }))
        setItems(mapped)
      } catch (e) {
        console.error('Add to panier failed', e)
        // optional: rollback or show error
      }
    }
  }

  const changeQty = async (productId, qty) => {
    // local change
    setItems(prev => prev.map(p => p.id === productId ? { ...p, qty } : p))
    // if logged and we have panierItemId, call server update
    if (user) {
      const it = items.find(i => i.id === productId)
      const panierItemId = it?.panierItemId
      try {
        if (panierItemId) {
          await updatePanierItem(panierItemId, qty)
        } else {
          // fallback: add as new item with qty
          await addPanierItem(productId, qty)
        }
      } catch (e) {
        console.error('Update panier item failed', e)
      }
    }
  }

  const remove = async (productId) => {
    const item = items.find(i => i.id === productId)
    setItems(prev => prev.filter(p => p.id !== productId))
    if (user && item?.panierItemId) {
      try {
        await removePanierItem(item.panierItemId)
      } catch (e) {
        console.error('Remove panier item failed', e)
      }
    }
  }

  const clear = () => {
    setItems([])
  }

  const total = items.reduce((s, i) => s + (i.price * i.qty), 0)

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, remove, clear, total, loading }}>
      {children}
    </CartContext.Provider>
  )
}
