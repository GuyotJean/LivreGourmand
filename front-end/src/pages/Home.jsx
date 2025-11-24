import React, { useEffect, useState } from "react";
import { listOuvrages } from "../services/ouvrageService";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await listOuvrages({ search });
        //console.log('API data:', data)

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.ouvrages)) {
          setProducts(data.ouvrages);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error("Error fetching products:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search]);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Books</h2>
        <div className="w-50">
          <input
            className="form-control"
            placeholder="Search by title, author, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="row g-3">
          {(!Array.isArray(products) || products.length === 0) && (
            <div className="col-12">No books found.</div>
          )}

          {Array.isArray(products) &&
            products.map((p) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
