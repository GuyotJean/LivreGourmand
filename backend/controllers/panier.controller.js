import db from "../db.js";

/**
 * Récupérer le panier actuel du client
 */
export const getPanier = async (req, res) => {
  const clientId = req.user.id;

  try {
    const [panierRows] = await db.query(
      `SELECT id FROM panier WHERE client_id = ? AND actif = 1`,
      [clientId]
    );

    if (panierRows.length === 0) return res.json([]);

    const panierId = panierRows[0].id;

    const [items] = await db.query(
      `SELECT pi.id AS panier_item_id, o.id AS ouvrage_id, o.titre, pi.quantite, pi.prix_unitaire, (pi.quantite * pi.prix_unitaire) AS total
       FROM panier_items pi
       JOIN ouvrages o ON pi.ouvrage_id = o.id
       WHERE pi.panier_id = ?`,
      [panierId]
    );

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Ajouter un item au panier
 */
export const addItem = async (req, res) => {
  const { ouvrage_id, quantite } = req.body;
  const clientId = req.user.id;

  try {
    let [panierRows] = await db.query(
      `SELECT id FROM panier WHERE client_id = ? AND actif = 1`,
      [clientId]
    );

    let panierId;
    if (panierRows.length > 0) {
      panierId = panierRows[0].id;
    } else {
      const [result] = await db.query(
        `INSERT INTO panier (client_id) VALUES (?)`,
        [clientId]
      );
      panierId = result.insertId;
    }

    const [exist] = await db.query(
      `SELECT id, quantite FROM panier_items WHERE panier_id = ? AND ouvrage_id = ?`,
      [panierId, ouvrage_id]
    );

    if (exist.length > 0) {
      await db.query(
        `UPDATE panier_items SET quantite = quantite + ? WHERE id = ?`,
        [quantite, exist[0].id]
      );
    } else {
      const [ouvrageRows] = await db.query(
        `SELECT prix FROM ouvrages WHERE id = ?`,
        [ouvrage_id]
      );
      if (ouvrageRows.length === 0)
        return res.status(404).json({ message: "Ouvrage non trouvé" });
      const prix = ouvrageRows[0].prix;

      await db.query(
        `INSERT INTO panier_items (panier_id, ouvrage_id, quantite, prix_unitaire)
         VALUES (?, ?, ?, ?)`,
        [panierId, ouvrage_id, quantite, prix]
      );
    }

    res.status(201).json({ message: "Article ajouté au panier" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Modifier la quantité d'un item
 */
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;
  const clientId = req.user.id;

  try {
    const [panierRows] = await db.query(
      `SELECT id FROM panier WHERE client_id = ? AND actif = 1`,
      [clientId]
    );

    if (panierRows.length === 0) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    const panierId = panierRows[0].id;

    const [result] = await db.query(
      `UPDATE panier_items SET quantite = ? WHERE id = ? AND panier_id = ?`,
      [quantite, id, panierId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Article non trouvé dans le panier" });
    }

    res.json({ message: "Quantité mise à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Retirer un item du panier
 */
export const removeItem = async (req, res) => {
  const { id } = req.params;
  const clientId = req.user.id;

  try {
    const [panierRows] = await db.query(
      `SELECT id FROM panier WHERE client_id = ? AND actif = 1`,
      [clientId]
    );

    if (panierRows.length === 0) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    const panierId = panierRows[0].id;

    const [result] = await db.query(
      `DELETE FROM panier_items WHERE id = ? AND panier_id = ?`,
      [id, panierId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Article non trouvé dans le panier" });
    }

    res.json({ message: "Article retiré du panier" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
