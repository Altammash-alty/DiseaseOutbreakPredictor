import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App, { ModelPage, DataPage, RegionsPage, AboutPage } from "./App.jsx";

// Import your existing dashboard component
import Dashboard from "./dashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/model" element={<ModelPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/regions" element={<RegionsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
