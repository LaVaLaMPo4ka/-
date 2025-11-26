import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Nav(){
  const loc = useLocation();
  const navClass = (path) => loc.pathname === path ? 'underline' : '';
  return (
    <div className="w-full px-4">
      <nav className="glass max-w-6xl mx-auto rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">Azatara</Link>
          <span className="text-sm text-gray-300">Версия 1.21 - 1.21.8</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" data-glow="about" className={`nav-link ${navClass('/')}`}>Главная</Link>
          <Link to="/about" data-glow="about" className={`nav-link ${navClass('/about')}`}>О сервере</Link>
          <Link to="/rules" data-glow="rules" className={`nav-link ${navClass('/rules')}`}>Правила</Link>
          <Link to="/donat" data-glow="donat" className={`nav-link ${navClass('/donat')}`}>Донат</Link>
          <Link to="/features" data-glow="features" className={`nav-link ${navClass('/features')}`}>Возможности</Link>
          <Link to="/crafts" data-glow="crafts" className={`nav-link ${navClass('/crafts')}`}>Крафты</Link>
          <a href="https://discord.gg/mnT6B4NBcc" target="_blank" rel="noreferrer" className="btn btn-accent">Discord</a>
        </div>
      </nav>
    </div>
  );
}
