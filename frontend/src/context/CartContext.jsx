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

  // Persister le panier local
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // Quand l'utilisateur se connecte, charger le panier du serveur et fusionner avec le local
  useEffect(() => {
    if (user) {
      (async () => {
        try {
          setLoading(true)
          // Lire les articles locaux du localStorage pour éviter la dépendance circulaire
          const localItemsRaw = localStorage.getItem('cart')
          const localItems = localItemsRaw ? JSON.parse(localItemsRaw) : []

          const serverItems = await fetchPanier() // retourne un tableau d'articles avec panier_item_id, ouvrage_id, titre, quantite, prix_unitaire, total
          // Mapper les articles du serveur vers notre format de produit
          const mapped = serverItems.map(si => ({
            id: si.ouvrage_id,
            panierItemId: si.panier_item_id,
            title: si.titre,
            qty: si.quantite,
            price: Number(si.prix_unitaire),
            image: si.image || null
          }))

          // Fusionner le panier local avec le serveur
          if (mapped.length > 0) {
            // S'il y a des articles sur le serveur, synchroniser les articles locaux qui ne sont pas sur le serveur
            const itemsToAdd = localItems.filter(li => !mapped.find(mi => mi.id === li.id))
            for (const localItem of itemsToAdd) {
              try {
                await addPanierItem(localItem.id, localItem.qty)
              } catch (e) {
                console.warn('Erreur lors de l\'ajout de l\'article local au serveur:', e)
              }
            }
            // Recharger du serveur pour avoir l'état à jour
            const updatedServerItems = await fetchPanier()
            const updatedMapped = updatedServerItems.map(si => ({
              id: si.ouvrage_id,
              panierItemId: si.panier_item_id,
              title: si.titre,
              qty: si.quantite,
              price: Number(si.prix_unitaire),
              image: si.image || null
            }))
            setItems(updatedMapped)
          } else if (localItems.length > 0) {
            // Si le serveur est vide mais il y a des articles locaux, ajouter tous au serveur
            for (const item of localItems) {
              try {
                await addPanierItem(item.id, item.qty)
              } catch (e) {
                console.warn('Erreur lors de l\'ajout de l\'article au serveur:', e)
              }
            }
            // Recharger du serveur
            const updatedServerItems2 = await fetchPanier()
            const updatedMapped2 = updatedServerItems2.map(si => ({
              id: si.ouvrage_id,
              panierItemId: si.panier_item_id,
              title: si.titre,
              qty: si.quantite,
              price: Number(si.prix_unitaire),
              image: si.image || null
            }))
            setItems(updatedMapped2)
          } else {
            // Si les deux sont vides, simplement définir items vide
            setItems([])
          }
        } catch (e) {
          console.warn('Échec du chargement du panier du serveur', e)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [user])

  const addItem = async (product, qty = 1) => {
    // Mise à jour locale optimiste
    setItems(prev => {
      const ex = prev.find(p => p.id === product.id)
      if (ex) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qty } : p)
      return [...prev, { id: product.id, title: product.titre || product.title, qty, price: Number(product.prix ?? product.price ?? 0), image: product.image || null }]
    })

    // Si connecté, appeler le serveur pour ajouter (le backend gère les vérifications de stock et retourne un message)
    if (user) {
      try {
        await addPanierItem(product.id, qty)
        // Après l'ajout au serveur, rafraîchir le panier pour obtenir panier_item_id etc
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
        console.error('Échec de l\'ajout au panier', e)
        // optionnel: annuler ou afficher une erreur
      }
    }
  }

  const changeQty = async (productId, qty) => {
    // Changement local
    setItems(prev => prev.map(p => p.id === productId ? { ...p, qty } : p))
    // Si connecté et nous avons panierItemId, appeler la mise à jour du serveur
    if (user) {
      const it = items.find(i => i.id === productId)
      const panierItemId = it?.panierItemId
      try {
        if (panierItemId) {
          await updatePanierItem(panierItemId, qty)
        } else {
          // Solution de secours: ajouter comme nouvel article avec qty
          await addPanierItem(productId, qty)
        }
      } catch (e) {
        console.error('Échec de la mise à jour de l\'article du panier', e)
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
        console.error('Échec de la suppression de l\'article du panier', e)
      }
    }
  }

  const clear = () => {
    setItems([])
  }

  // Synchroniser le panier local avec le serveur avant le paiement
  const syncCart = async () => {
    if (!user) {
      throw new Error('Vous devez être connecté pour effectuer le paiement')
    }

    try {
      setLoading(true)
      // Pour chaque article dans le panier local, s'assurer qu'il est sur le serveur
      for (const item of items) {
        if (!item.panierItemId) {
          // L'article n'est pas sur le serveur, l'ajouter
          await addPanierItem(item.id, item.qty)
        } else {
          // Vérifier si la quantité est correcte
          const serverItems = await fetchPanier()
          const serverItem = serverItems.find(si => si.panier_item_id === item.panierItemId)
          if (serverItem && serverItem.quantite !== item.qty) {
            await updatePanierItem(item.panierItemId, item.qty)
          }
        }
      }
      // Mettre à jour les articles avec les données du serveur
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
      console.error('Erreur lors de la synchronisation du panier:', e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((s, i) => s + (i.price * i.qty), 0)

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, remove, clear, syncCart, total, loading }}>
      {children}
    </CartContext.Provider>
  )
}
