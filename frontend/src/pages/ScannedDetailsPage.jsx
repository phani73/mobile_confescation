import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';  // Importing the back icon from react-icons
import "../css/ScannedDetailsPage.css";

const ScannedDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate hook for navigation
  const scanResult = location.state; // Retrieve scan result from navigation state

  const [name, setName] = useState('');
  const [phoneCompany, setPhoneCompany] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePhoneCompanyChange = (e) => {
    setPhoneCompany(e.target.value);
  };
const saveDetails = async () => {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  console.log("Token being sent:", token);
  

  const savedData = {
    receiptNumber: scanResult?.receiptNumber,
    rollNo: scanResult?.rollNo,
    timestamp: scanResult?.timestamp,
    date: scanResult?.date,
    name,
    phoneCompany,
  };
  console.log("Saved Data being sent:", savedData);

  try {
    const response = await fetch("http://localhost:5000/api/save-scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
      body: JSON.stringify(savedData),
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message); // Show success message
    } else {
      const errorData = await response.json();
      console.error("Save failed:", errorData);
      alert(errorData.message || "Failed to save data. Please try again.");
    }
  } catch (error) {
    console.error("Error saving data:", error);
    alert("An error occurred. Please try again.");
  }
};


  const handleDownloadReceipt = () => {
    const content = `
      RECEIPT NUMBER: ${scanResult?.receiptNumber || "N/A"}\n
      ROLL NO: ${scanResult?.rollNo || "N/A"}\n
      DATE: ${scanResult?.date || "N/A"}\n
      TIME: ${scanResult?.timestamp || "N/A"}\n
      NAME: ${name || "N/A"}\n
      PHONE COMPANY: ${phoneCompany || "N/A"}\n
      ------------------------------------------\n
      Approved by: Head of Department\n
      Thank you!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${scanResult?.rollNo || "unknown"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const goBack = () => {
    navigate('/dashboard'); // Navigate to the dashboard page
  };

  return (
    <div className="form-container" style={{ height: '100vh' }}>
      <div className="header-container">
        <FaArrowLeft onClick={goBack} className="back-icon" /> {/* Back icon */}
        <h2 className="form-header">Student Details</h2>
      </div>

      <form className="scan-form">
        {scanResult ? (
          <div className="form-group">
            <label><strong>RECEIPT NUMBER:</strong></label>
            <input
              type="text"
              value={scanResult.receiptNumber}
              readOnly
              className="form-input"
            />

            <label><strong>ROLL NO:</strong></label>
            <input
              type="text"
              value={scanResult.rollNo}
              readOnly
              className="form-input"
            />

            <label><strong>TIME:</strong></label>
            <input
              type="text"
              value={scanResult.timestamp}
              readOnly
              className="form-input"
            />

            <label><strong>DATE:</strong></label>
            <input
              type="text"
              value={scanResult.date}
              readOnly
              className="form-input"
            />
          </div>
        ) : (
          <p className="no-details">No scan details available.</p>
        )}

        <div className="extra-card">
          <div className="form-group">
            <label><strong>NAME:</strong></label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="form-input"
            />

            <label><strong>PHONE COMPANY (Optional):</strong></label>
            <input
              type="text"
              value={phoneCompany}
              onChange={handlePhoneCompanyChange}
              className="form-input"
            />
          </div>
        </div>
      </form>
      <button onClick={saveDetails}>Save</button>
      <button onClick={handleDownloadReceipt}>Download Receipt</button>
    </div>
  );
};

export default ScannedDetailsPage;