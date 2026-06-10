import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AOS from "aos";
import App from "./App";
import "aos/dist/aos.css";
import "./styles/hanwha.css";
import "./styles/overrides.css";
import "./styles/mobile-menu.css";
import "./styles/product-section.css";
import "./styles/gallery-section.css";
import "./styles/home-mobile.css";

AOS.init({ duration: 1200, once: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
