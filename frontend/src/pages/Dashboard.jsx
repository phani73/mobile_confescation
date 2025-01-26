import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineSearch, AiOutlineLogout } from "react-icons/ai";
import "../css/Dashboard.css";

const Dashboard = () => {
  const [confiscations, setConfiscations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true); // For handling loading state
  const [error, setError] = useState(""); // For handling errors

  const navigate = useNavigate();
useEffect(() => {
  const fetchConfiscations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Debug: Check if the token exists
      console.log("Token from localStorage:", token);

      // Check if token is present
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const response = await fetch("http://localhost:5000/api/get-scans", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Debug: Check if the response is okay
      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error("Failed to fetch confiscations.");
      }

      const data = await response.json();
      const formattedData = data.map((item) => ({
        receiptNo: item.receiptNumber,
        rollNo: item.rollNo,
        name: item.name,
        company: item.phoneCompany,
        date: item.date,
        status: "Pending", // Default status; backend should include status field for production
      }));
      setConfiscations(formattedData);
    } catch (err) {
      console.error("Error fetching confiscations:", err.message);
      setError(err.message);
      if (err.message.includes("Unauthorized")) {
        handleLogout(); // Auto-logout on token expiration
      }
    } finally {
      setLoading(false);
    }
  };

  fetchConfiscations();
}, [navigate]);


  const handleReturn = (receiptNo) => {
    setSelectedReceipt(receiptNo);
    setShowDialog(true);
  };

  const confirmReturn = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/delete-scan/${selectedReceipt}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark the item as returned.");
      }

      // Update the UI
      setConfiscations((prevState) =>
        prevState.filter((item) => item.receiptNo !== selectedReceipt)
      );

      setShowDialog(false);
      setSelectedReceipt(null);
    } catch (err) {
      console.error(err.message);
      setError("Error processing the return. Please try again.");
    }
  };

  const cancelReturn = () => {
    setShowDialog(false);
    setSelectedReceipt(null);
  };

  const filteredConfiscations = confiscations.filter((item) =>
    item.receiptNo.includes(searchTerm) || item.rollNo.includes(searchTerm)
  );

  const pendingCount = confiscations.filter((item) => item.status === "Pending")
    .length;
  const returnedCount = confiscations.filter((item) => item.status === "Returned")
    .length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Show loading state while data is being fetched
  if (loading) {
    return <div className="loading-container">Loading data...</div>;
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
        <button onClick={handleLogout} className="logout-button">
          <AiOutlineLogout size={24} /> Logout
        </button>
      </div>

      <div className="status-card-container">
        <div className="status-card">
          <h3>Pending</h3>
          <p>{pendingCount}</p>
        </div>
        <div className="status-card">
          <h3>Returned</h3>
          <p>{returnedCount}</p>
        </div>
      </div>

      <div className="dashboard-header">
        <h2 className="dashboard-subtitle">Recent Confiscations</h2>
        <div className="search-container">
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Enter receipt or roll number"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">
              <AiOutlineSearch size={20} />
            </button>
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
                  {item.status === "Pending" && (
                    <button
                      onClick={() => handleReturn(item.receiptNo)}
                      className="return-button"
                    >
                      Return
                    </button>
                  )}
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
