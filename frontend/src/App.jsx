import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Product from "./pages/Product";
import RechercheAvancee from "./pages/RechercheAvancee";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import ChatBox from "./components/ChatBox"

export default function App() {
  return (
    <>
      <Header />
      <main className="py-4" style={{ marginTop: "76px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ouvrages/:id" element={<Product />} />
          <Route path="/recherche-avancee" element={<RechercheAvancee />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/commandes" element={<Orders />} />
          <Route path="/commandes/:id" element={<OrderDetail />} />
        </Routes>
        <ChatBox />
      </main>
      <Footer />
    </>
  );
}
