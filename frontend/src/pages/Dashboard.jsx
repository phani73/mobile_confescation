import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineLogout, AiOutlineKey, AiOutlineHistory } from "react-icons/ai";
import Loader from "./Loader"; // Importing the Loader component
import "../css/Dashboard.css";

const Dashboard = () => {
  const [confiscations, setConfiscations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true); // For handling loading state
  const [error, setError] = useState(""); // For handling errors
  const [scanCounts, setScanCounts] = useState({ returnedCount: 0 }); // Store only returned count

  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfiscations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Check if token is present
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch("http://localhost:5000/api/get-scans", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized. Please login again.");
          }
          throw new Error("Failed to fetch confiscations.");
        }

        const data = await response.json();
        const formattedData = data
          .filter(item => item.status === "Pending") // Only include Pending items
          .map((item) => ({
            receiptNo: item.receiptNumber,
            rollNo: item.rollNo,
            name: item.name,
            company: item.phoneCompany,
            date: item.date,
            status: item.status || "Pending", // Use status from the backend or default to Pending
          }));
        setConfiscations(formattedData);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          handleLogout(); // Auto-logout on token expiration
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchScanCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/scan-counts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch scan counts.");
        }

        const data = await response.json();
        setScanCounts(data); // Update only returned count
      } catch (err) {
        setError("Error fetching scan counts.");
      }
    };

    fetchConfiscations();
    fetchScanCounts(); // Fetch the scan counts (only returned count)
  }, [navigate]);

  const handleReturn = (receiptNo) => {
    setSelectedReceipt(receiptNo);
    setShowDialog(true);
  };

const confirmReturn = async () => {
  try {
    const token = localStorage.getItem("token");

    // Close the dialog immediately for better user experience
    setShowDialog(false);

    // Optimistically update the confiscations state
    const updatedConfiscations = confiscations.map((item) =>
      item.receiptNo === selectedReceipt
        ? { ...item, status: "Returned" }
        : item
    );
    setConfiscations(updatedConfiscations);

    // Call the backend to mark as returned
    const response = await fetch(
      `http://localhost:5000/api/return-scan/${selectedReceipt}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      // If the backend call fails, revert the state and show an error
      setConfiscations(confiscations); // Revert to the original state
      throw new Error("Failed to mark the item as returned.");
    }

    // Fetch the updated scan counts
    fetchScanCounts();
  } catch (err) {
    // Handle the error gracefully
    setError(err.message || "An unexpected error occurred. Please try again.");
  } finally {
    // Clear the selected receipt after operation
    setSelectedReceipt(null);
  }
};




  const cancelReturn = () => {
    setShowDialog(false);
    setSelectedReceipt(null);
  };

  const filteredConfiscations = confiscations.filter((item) =>
    item.receiptNo.includes(searchTerm) || item.rollNo.includes(searchTerm)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleViewHistory = () => {
    navigate("/history"); // Assuming you have a history route
  };

  // Show loading state while data is being fetched
  if (loading) {
    return <Loader />; // Using Loader component here
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={handleLogout} className="logout-button">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Mobile Confiscation Dashboard</h1>

      <div className="logout-button-container">
        <div className="button-group">
          <button onClick={handleLogout} className="logout-button">
            <AiOutlineLogout size={24} /> Logout
          </button>
          <button onClick={handleChangePassword} className="logout-button">
            <AiOutlineKey size={24} /> Change Password
          </button>
          <button onClick={handleViewHistory} className="logout-button">
            <AiOutlineHistory size={24} /> History
          </button>
        </div>
      </div>

      <div className="status-card-container">
        <div className="status-card">
          <h3>Pending</h3>
          <p>{confiscations.length}</p> {/* Display count of pending confiscations */}
        </div>
        <div className="status-card">
          <h3>Returned</h3>
          <p>{scanCounts.returnedCount}</p> {/* Display count of returned confiscations */}
        </div>
      </div>

      <div className="dashboard-header">
        <h2 className="dashboard-subtitle">Pending Confiscations</h2>
        <div className="search-container">
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Enter receipt or roll number"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </div>

      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Roll No</th>
              <th>Name</th>
              <th>Company</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfiscations.map((item, index) => (
              <tr key={index}>
                <td>{item.receiptNo}</td>
                <td>{item.rollNo}</td>
                <td>{item.name}</td>
                <td>{item.company}</td>
                <td>{item.date}</td>
                <td className={`status ${item.status.toLowerCase()}`}>
                  {item.status}
                </td>
                <td>
                  <button
                    onClick={() => handleReturn(item.receiptNo)}
                    className="return-button"
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-container">
        <Link to="/qr-scanner">
          <button className="scan-button">Go to QR Scanner</button>
        </Link>
      </div>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Confirmation</h3>
            <p>
              Are you sure you want to return receipt #
              {
                filteredConfiscations.find(
                  (item) => item.receiptNo === selectedReceipt
                )?.receiptNo
              }
              ?
            </p>
            <div className="dialog-actions">
              <button onClick={confirmReturn} className="confirm-button">
                Yes
              </button>
              <button onClick={cancelReturn} className="cancel-button">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
