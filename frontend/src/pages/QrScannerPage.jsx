import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa"; // Importing back arrow icon
import jsQR from 'jsqr';
import "../css/QrScannerPage.css";

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualRollNo, setManualRollNo] = useState(""); // State for manual input
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve the last receipt number from localStorage or initialize it to 1
  const getNextReceiptNumber = () => {
    const lastReceiptNumber = parseInt(localStorage.getItem("lastReceiptNumber")) || 0;
    const newReceiptNumber = lastReceiptNumber + 1;
    localStorage.setItem("lastReceiptNumber", newReceiptNumber); // Save the new receipt number
    return newReceiptNumber.toString().padStart(6, "0"); // Format as 6 digits
  };

  const handleScanSuccess = (decodedText) => {
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    const receiptNumber = getNextReceiptNumber(); // Get the new receipt number

    const scanData = {
      rollNo: decodedText,
      timestamp: currentTime,
      date: currentDate,
      receiptNumber, // Add receipt number to scan data
    };

    setScanResult(scanData);
    alert(`QR Code Data: ${decodedText}`);
    navigate('/form', { state: scanData });
  };

  const handleVideoRef = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.play();

        const scanInterval = setInterval(() => {
          try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

            if (code) {
              clearInterval(scanInterval);
              handleScanSuccess(code.data);
            }
          } catch (error) {
            console.error("Error scanning QR code:", error);
          }
        }, 300); // Adjust interval as needed

        return () => {
          clearInterval(scanInterval);
          stream.getTracks().forEach((track) => track.stop()); // Stop camera when unmounting
        };
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }
  };

  useEffect(() => {
    handleVideoRef();
  }, []);

  const handleGoButtonClick = () => {
    if (manualRollNo.trim() === "") {
      alert("Please enter a roll number.");
      return;
    }

    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    const receiptNumber = getNextReceiptNumber();

    const scanData = {
      rollNo: manualRollNo,
      timestamp: currentTime,
      date: currentDate,
      receiptNumber,
    };

    navigate('/form', { state: scanData });
  };

  const goBack = () => {
    navigate('/dashboard'); // Navigate to the dashboard page
  };

  return (
    <div className="scanner-container">
      <div className="back-button-container" onClick={goBack}>
        <FaArrowLeft className="back-icon" />
      </div>
      <h2>QR Code Scanner</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Video Scanner */}
      <div className="video-container">
        <video ref={videoRef} />
      </div>

      {/* Manual Input Field */}
      <div className="manual-input-container">
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={manualRollNo}
          onChange={(e) => setManualRollNo(e.target.value)}
          className="manual-input"
        />
        <button onClick={handleGoButtonClick} className="go-button">Go</button>
      </div>
    </div>
  );
};

export default QRScannerPage;
