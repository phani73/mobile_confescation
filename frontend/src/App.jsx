import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import QrScannerPage from "./pages/QrScannerPage";
import ScannedDetailsPage from "./pages/ScannedDetailsPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<LoginPage />} /> 
         <Route path="/login" element={<LoginPage />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/qr-scanner" element={<QrScannerPage />} />
         <Route path="/form" element={<ScannedDetailsPage />} />

     
      </Routes>
    </BrowserRouter>
  );
};

export default App;
