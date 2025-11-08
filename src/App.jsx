import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./Pages/Login";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChartPage from "./pages/ChartPage";
import AdsManagement from "./Pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import "./App.css";


function App() {

    const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);



if(token === ''){
  return (<Login setToken={setToken} setRole={setRole}/>)
}else{
  

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
          <Route path="/" element={<Login />} />
        </Routes>
      </main>
    </div>
    
  );}
}

export default App;
