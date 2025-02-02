import React from "react";
import { useNavigate } from "react-router-dom"; 
import videoFile from "../assets/mobile1.mp4"; 
import "../css/IntroPage.css";

const VideoPage = () => {
  const navigate = useNavigate();


  const handleVideoEnd = () => {
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="video-page">
      <div className="video-container">
        <video
          src={videoFile}
          autoPlay
          loop={false} 
          muted
          className="video-element"
          playsInline
          onEnded={handleVideoEnd} 
        ></video>
      </div>
    </div>
  );
};

export default VideoPage;
