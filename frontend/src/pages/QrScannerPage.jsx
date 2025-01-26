import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import "../css/QrScannerPage.css";

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve the last receipt number from localStorage or initialize it to 1
  const getNextReceiptNumber = () => {
    const lastReceiptNumber = parseInt(localStorage.getItem("lastReceiptNumber")) || 0;
    const newReceiptNumber = lastReceiptNumber + 1;
    localStorage.setItem("lastReceiptNumber", newReceiptNumber); // Save the new receipt number
    return newReceiptNumber.toString().padStart(6, "0"); // Format as 6 digits
  };

  useEffect(() => {
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
            if (stream && stream.getTracks) {
              stream.getTracks().forEach((track) => track.stop());
            }
          };
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      }
    };

    handleVideoRef();
  }, [videoRef]);

  return (
    <div>
      <h2>QR Code Scanner</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="video-container">
        <video
          ref={videoRef}
        />
      </div>
    </div>
  );
};

export default QRScannerPage;
