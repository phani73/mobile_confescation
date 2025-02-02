import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import IntroPage from "./pages/IntroPage"
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import QrScannerPage from "./pages/QrScannerPage";
import ScannedDetailsPage from "./pages/ScannedDetailsPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HistoryPage from "./pages/HistoryPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<IntroPage />} /> 
         <Route path="/login" element={<LoginPage />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/qr-scanner" element={<QrScannerPage />} />
         <Route path="/form" element={<ScannedDetailsPage />} />
         <Route path="/change-password" element={<ResetPasswordPage/>} />
         <Route path="/history" element={<HistoryPage />}/>
   
      </Routes>
    </BrowserRouter>
  );
};

export default App;
