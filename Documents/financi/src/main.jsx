import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/index.css";

// HashRouter em vez de BrowserRouter: GitHub Pages é um host estático puro,
// sem rewrite de servidor para SPA — com HashRouter, recarregar qualquer
// rota (ex.: /#/transacoes) sempre funciona, sem precisar de truque de
// 404.html. A URL final fica com "#" (ex.: usuario.github.io/repo/#/metas).
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);