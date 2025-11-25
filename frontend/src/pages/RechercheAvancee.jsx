import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listOuvrages } from "../services/ouvrageService";
import { listCategories } from "../services/categorieService";
import ProductCard from "../components/ProductCard";

export default function RechercheAvancee() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    titre: "",
    auteur: "",
    isbn: "",
    categorie_id: "",
    prix_min: "",
    prix_max: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await listCategories();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      // Construire les paramètres de recherche - chaque champ dans son propre champ
      const params = {};
      
      if (filters.titre && filters.titre.trim()) {
        params.titre = filters.titre.trim();
      }
      
      if (filters.auteur && filters.auteur.trim()) {
        params.auteur = filters.auteur.trim();
      }
      
      if (filters.isbn && filters.isbn.trim()) {
        params.isbn = filters.isbn.trim();
      }
      
      if (filters.categorie_id) {
        params.categorie = filters.categorie_id;
      }
      
      // Récupérer les ouvrages correspondants
      const data = await listOuvrages(params);
      let results = Array.isArray(data) ? data : (data?.ouvrages || []);
      
      // Filtrer par prix minimum si fourni (filtrage côté frontend)
      if (filters.prix_min && filters.prix_min.trim()) {
        const prixMin = Number(filters.prix_min);
        if (!isNaN(prixMin)) {
          results = results.filter(p => Number(p.prix || 0) >= prixMin);
        }
      }
      
      // Filtrer par prix maximum si fourni (filtrage côté frontend)
      if (filters.prix_max && filters.prix_max.trim()) {
        const prixMax = Number(filters.prix_max);
        if (!isNaN(prixMax)) {
          results = results.filter(p => Number(p.prix || 0) <= prixMax);
        }
      }
      
      setProducts(results);
    } catch (e) {
      console.error("Erreur recherche:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Recherche avancée par critères</h2>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Titre</label>
              <input
                type="text"
                className="form-control"
                value={filters.titre}
                onChange={(e) => handleFilterChange("titre", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Auteur</label>
              <input
                type="text"
                className="form-control"
                value={filters.auteur}
                onChange={(e) => handleFilterChange("auteur", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Numéro ISBN</label>
              <input
                type="text"
                className="form-control"
                value={filters.isbn}
                onChange={(e) => handleFilterChange("isbn", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Catégorie</label>
              <select
                className="form-select"
                value={filters.categorie_id}
                onChange={(e) => handleFilterChange("categorie_id", e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Prix minimum ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={filters.prix_min}
                onChange={(e) => handleFilterChange("prix_min", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Prix maximum ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={filters.prix_max}
                onChange={(e) => handleFilterChange("prix_max", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? "Recherche..." : "Rechercher"}
            </button>
            <button 
              className="btn btn-outline-secondary ms-2" 
              onClick={() => {
                setFilters({
                  titre: "",
                  auteur: "",
                  isbn: "",
                  categorie_id: "",
                  prix_min: "",
                  prix_max: "",
                });
                setProducts([]);
              }}
            >
              Vider les champs
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {products.length > 0 && (
        <>
          <h3 className="mb-3">Résultats de la recherche</h3>
          <p className="text-muted mb-3">
            Cliquer sur une image pour accéder à la description détaillée de l'ouvrage et commander
          </p>
          <div className="row g-3">
            {products.map((p) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && products.length === 0 && Object.values(filters).some((v) => v) && (
        <div className="alert alert-info">Aucun résultat trouvé avec ces critères.</div>
      )}
    </div>
  );
}

