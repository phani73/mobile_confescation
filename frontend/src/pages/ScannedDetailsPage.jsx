import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Importing the back icon from react-icons
import Loader from './Loader'; // Importing Loader for net latency handling
import "../css/ScannedDetailsPage.css";

const ScannedDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate hook for navigation
  const scanResult = location.state; // Retrieve scan result from navigation state

  const [name, setName] = useState('');
  const [phoneCompany, setPhoneCompany] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for network latency

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePhoneCompanyChange = (e) => {
    setPhoneCompany(e.target.value);
  };

  const saveDetails = async () => {
    setLoading(true); // Set loading to true when saving starts

    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    const savedData = {
      receiptNumber: scanResult?.receiptNumber,
      rollNo: scanResult?.rollNo,
      timestamp: scanResult?.timestamp,
      date: scanResult?.date,
      name,
      phoneCompany,
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(savedData),
      });

      setLoading(false); // Set loading to false when request completes

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show success message
      } else {
        const errorData = await response.json();
        console.error("Save failed:", errorData);
        alert(errorData.message || "Fill the all the required fields. Please try again.");
      }
    } catch (error) {
      setLoading(false); // Set loading to false in case of error
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
    setLoading(true); // Set loading when navigating back

    setTimeout(() => {
      setLoading(false); // Simulate latency for demonstration (useful with real latency too)
      navigate('/qr-scanner'); // Navigate to the dashboard page
    }, 2000); // Simulating network latency of 2 seconds
  };

  return (
    <div className="form-container" style={{ height: '110vh' }}>
      {loading && <Loader />} {/* Show loader during network latency */}

      {!loading && (
        <>
          <div className="header-container">
           <div className="back-button-container" onClick={goBack}>
  <FaArrowLeft className="back-icon" />
</div>

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

            {/* Ensure Name and Phone Company fields are part of the form */}
            <div className="form-group">
              <label><strong>NAME:</strong></label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="form-input"
              />

              <label><strong>Remarks (Optional):</strong></label>
              <input
                type="text"
                value={phoneCompany}
                onChange={handlePhoneCompanyChange}
                className="form-input"
              />

            </div>
          </form>
          <button onClick={saveDetails}>Save</button>
          <button onClick={handleDownloadReceipt}>Download Receipt</button>
        </>
      )}
    </div>
  );
};

export default ScannedDetailsPage;
