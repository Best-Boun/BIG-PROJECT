import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChartPage from "./pages/ChartPage";
import AdsManagement from "./Pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import "./App.css";


function App() {

  const [isOpen, setIsOpen] = useState(true);
  

  return (
    <div className="app">
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      <Sidebar className={isOpen ? "" : "hidden"} />
      <main className="main">
        <Routes>
          <Route path="/chart" element={<ChartPage />} />
          <Route path="/ads" element={<AdsManagement />} />
          <Route path="/admin" element={<AdminManagement />} />
        </Routes>
      </main>
    </div>
    
  );
}

export default App;
