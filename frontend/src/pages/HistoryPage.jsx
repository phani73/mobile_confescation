import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; 
import Loader from "./Loader";
import "../css/HistoryPage.css";

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("No token found. Please log in.");
                }

                const response = await fetch("http://localhost:5000/api/history", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized. Please login again.");
                    }
                    throw new Error("Failed to fetch history.");
                }

                const data = await response.json();

                // Filter out scans where status is "Returned"
                const returnedScans = data.filter(item => item.status === "Returned");
                setHistory(returnedScans);
                setFilteredHistory(returnedScans); // Initialize filtered list
            } catch (err) {
                console.error("Error fetching history:", err.message);
                setError(err.message);
                if (err.message.includes("Unauthorized")) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Handle search input change
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter history based on receiptNumber or rollNo
        const filtered = history.filter(item =>
            item.receiptNumber.toLowerCase().includes(query) ||
            item.rollNo.toLowerCase().includes(query)
        );

        setFilteredHistory(filtered);
    };

    if (loading) {
        return <Loader />;
    }

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

    const handleBackToDashboard = () => {
    console.log("Navigating to /dashboard...");
    navigate("/dashboard");
};

 const goBack = () => {
    navigate('/dashboard'); // Navigate to the dashboard page
  };

    return (
        <div className="dashboard-container">
             <div className="back-button-container" onClick={goBack}>
                    <FaArrowLeft className="back-icon" />
                  </div>
            <h1 className="dashboard-title">History of Returns</h1>
            
            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by Receipt No or Roll No..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar"
                />
            </div>

            <div className="dashboard-table-container">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Receipt No</th>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Remarks</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.map((item, index) => (
                            <tr key={index}>
                                <td>{item.receiptNumber}</td>
                                <td>{item.rollNo}</td>
                                <td>{item.name}</td>
                                <td>{item.phoneCompany}</td>
                                <td>{item.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="button-container"> {/* Container for the button */}
                <button onClick={handleBackToDashboard} className="back-button">
    Back to Dashboard
        </button>

            </div>
        </div>
    );
};

export default HistoryPage;
