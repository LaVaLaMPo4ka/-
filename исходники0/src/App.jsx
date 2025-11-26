import React from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Background from "./components/Background";
import Home from "./pages/Home";
import Rules from "./pages/Rules";
import Features from "./pages/Features";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Donat from "./pages/Donat";
import Crafts from "./pages/Crafts";

export default function App(){
  return (
    <div className="min-h-screen text-gray-100 relative">
      <Background />
      <div className="relative z-10">
        <Nav />
        <main className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/donat" element={<Donat />} />
            <Route path="/crafts" element={<Crafts />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
