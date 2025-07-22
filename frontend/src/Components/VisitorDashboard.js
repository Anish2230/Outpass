import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autoTable
import { useNavigate, Link } from 'react-router-dom';

Modal.setAppElement("#root");

function VisitorDashboard() {
  const { fetcVisitordata } = useAuth();
  const navigate = useNavigate();
  const { visitoruser, visitorlogout } = useAuth();
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOutpass, setSelectedOutpass] = useState(null);
  const [profileView, setProfileView] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  let user = visitoruser;

  useEffect(() => {
    const token = localStorage.getItem('token-visitor');
    const fetchvisitordata = async () => {
      if (!token) {
        navigate('/visitor');
      } else {
        try {
          await fetcVisitordata(token);
          navigate('/visitor/dashboard');
        } catch (error) {
          console.error('Error fetching visitor data:', error);
          navigate('/visitor');
        }
      }
    };
    fetchvisitordata();
  }, []);

  useEffect(() => {
    const fetchOutpassHistory = async () => {
      try {
        const token = localStorage.getItem("token-visitor");
        const response = await fetch(`${apiUrl}/api/visitor/outpass-history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) { 
          throw new Error("Failed to fetch Entrypass history");
        }
        const data = await response.json();
        setOutpassRequests(data.visitorOutpasses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOutpassHistory();
  }, [apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(fromTime) >= new Date(toTime)) {
      setError("From time must be earlier than To time.");
      return;
    }

    const hasOverlap = outpassRequests.some((outpass) => {
      const outpassFromTime = new Date(outpass?.fromTime);
      const outpassToTime = new Date(outpass?.toTime);
      const newFromTime = new Date(fromTime);
      const newToTime = new Date(toTime);

      return (
        (newFromTime >= outpassFromTime && newFromTime < outpassToTime) ||
        (newToTime > outpassFromTime && newToTime <= outpassToTime) ||
        (newFromTime <= outpassFromTime && newToTime >= outpassToTime)
      );
    });

    if (hasOverlap) {
      setError("You already have an Entrypass during this time period.");
      return;
    }

    try {
      const token = localStorage.getItem("token-visitor");
      const response = await fetch(`${apiUrl}/api/visitor/request-outpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromTime, toTime, reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to request Entrypass");
      }

      const data = await response.json();
      setOutpassRequests([...outpassRequests, data.visitorOutpass]);
      setSuccessMessage("Entrypass request submitted successfully!");
      setFromTime("");
      setToTime("");
      setReason("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to request Entrypass. Please try again.");
    }
  };

  const generatePDF = (outpass) => {
    if (!user) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text("Visitor Outpass Details", 20, 20);
    doc.setLineWidth(0.75);
    doc.setDrawColor(0, 0, 255);
    doc.line(20, 22, 190, 22);
    doc.setDrawColor(0, 0, 255);
    doc.setLineWidth(0.5);
    doc.rect(15, 25, 180, 160);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text("Visitor Information", 20, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const visitorInfo = [
      `Name: ${user.visitorName}`,
      `Contact: ${user.visitorContact}`,
      `Email: ${user.visitoremail}`,
    ];
    visitorInfo.forEach((line, index) => {
      doc.text(line, 20, 45 + index * 10);
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text("Entrypass Details", 20, 85);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const outpassDetails = [
      `From: ${new Date(outpass?.fromTime).toLocaleString()}`,
      `To: ${new Date(outpass?.toTime).toLocaleString()}`,
      `Reason: ${outpass?.reason}`,
      `Status: ${outpass?.status}`,
    ];
    outpassDetails.forEach((line, index) => {
      doc.text(line, 20, 95 + index * 10);
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 150);

    const formattedDate = new Date(outpass?.fromTime)
      .toISOString()
      .replace(/[-T:\.Z]/g, "");
    doc.save(`${user.visitorName}-outpass-${formattedDate}.pdf`);
  };

  const approvedOutpasses = outpassRequests.filter(
    (outpass) => outpass?.status === "approved"
  );
  const pendingOutpasses = outpassRequests.filter(
    (outpass) => outpass?.status === "pending"
  );
  const pastOutpasses = outpassRequests.filter(
    (outpass) => new Date(outpass?.toTime) < new Date()
  );

  const renderOutpassList = () => {
    let outpasses = [];
    let label = "";

    switch (activeTab) {
      case "approved":
        outpasses = approvedOutpasses;
        label = "Approved Entrypass";
        break;
      case "pending":
        outpasses = pendingOutpasses;
        label = "Pending Entrypass";
        break;
      case "past":
        outpasses = pastOutpasses;
        label = "Past Entrypass";
        break;
      default:
        break;
    }

    return (
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-4">{label}</h3>
        <div className="overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-indigo-200 rounded-lg bg-gray-800 p-3">
          {outpasses.length > 0 ? (
            <ul className="space-y-4">
              {outpasses.map((outpass) => (
                <li
                  key={outpass?._id}
                  className="p-4 border border-gray-700 rounded-lg bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 text-gray-200"
                >
                  <p className="text-lg font-medium">
                    <strong>From:</strong>{" "}
                    {new Date(outpass?.fromTime).toLocaleString()}
                  </p>
                  <p className="text-lg font-medium">
                    <strong>To:</strong>{" "}
                    {new Date(outpass?.toTime).toLocaleString()}
                  </p>
                  <p className="text-lg font-medium">
                    <strong>Reason:</strong> {outpass?.reason}
                  </p>
                  <p className="text-lg font-medium flex items-center">
                    <span className="mr-2 font-bold">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        outpass.status === "approved"
                          ? "bg-green-600 text-green-100"
                          : outpass.status === "pending"
                          ? "bg-yellow-500 text-yellow-900"
                          : "bg-red-600 text-red-100"
                      }`}
                    >
                      {outpass?.status}
                    </span>
                  </p>
                  <div className="flex justify-end mt-4 space-x-4">
                    <button
                      onClick={() => setSelectedOutpass(outpass)}
                      className="text-lg text-indigo-400 hover:text-indigo-600 font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => generatePDF(outpass)}
                      className="text-lg text-green-400 hover:text-green-600 font-semibold"
                    >
                      Download PDF
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No Entrypass available.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 to-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Visitor Dashboard</h1>

      {/* Profile and Logout Section */}
      <div className="flex flex-col sm:flex-row justify-end items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out w-full sm:w-auto"
          onClick={() => setProfileView(!profileView)}
        >
          {profileView ? "Hide Profile" : "Show Profile"}
        </button>
        <Link to="/">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
            Back to Home
          </button>
        </Link>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out w-full sm:w-auto"
          onClick={() => visitorlogout()}
        >
          Logout
        </button>
      </div>

      {/* Profile Section */}
      {profileView && (
        <div className="mb-6 bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-lg transition-transform transform-gpu hover:scale-105 text-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <div className="space-y-2">
            <p className="text-lg">
              <strong>Name:</strong> {visitoruser?.visitorName}
            </p>
            <p className="text-lg">
              <strong>Email:</strong> {user?.visitoremail}
            </p>
            <p className="text-lg">
              <strong>Contact:</strong> {user?.visitorContact}
            </p>
          </div>
        </div>
      )}

      {/* Main container for side-by-side display */}
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        {/* Request Outpass Form */}
        <div className="w-full lg:w-1/2 bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-lg transition-transform transform-gpu hover:scale-105 text-gray-200">
          <h2 className="text-2xl font-semibold mb-6">Request Entrypass</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="fromTime" className="font-medium mb-1">From Time</label>
              <input
                type="datetime-local"
                id="fromTime"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-200"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="toTime" className="font-medium mb-1">To Time</label>
              <input
                type="datetime-local"
                id="toTime"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-200"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="reason" className="font-medium mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= 30) setReason(e.target.value);
                }}
                className="w-full p-3 text-lg rounded-lg bg-gray-800 border border-gray-700 text-gray-200"
                rows="2"
                required
              />
              <span className="text-sm text-gray-400">{30 - reason.length} characters remaining</span>
            </div>
            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm font-semibold">{successMessage}</p>}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-full font-semibold w-full transition duration-300"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Outpass Tabs and List */}
        <div className="w-full lg:w-1/2 bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-lg transition-transform transform-gpu hover:scale-105 text-gray-200">
          <h2 className="text-2xl font-semibold mb-6">Entrypass Status</h2>
          <div className="flex mb-6 gap-4">
            {["pending", "approved", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 w-1/3 rounded-lg transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {renderOutpassList()}
        </div>
      </div>

      {/* Modal */}
      {selectedOutpass && (
        <Modal
          isOpen={!!selectedOutpass}
          onRequestClose={() => setSelectedOutpass(null)}
          className="bg-gray-900 bg-opacity-95 p-10 rounded-lg shadow-2xl max-w-xl mx-auto mt-20 text-gray-200"
          overlayClassName="fixed inset-0 bg-black bg-opacity-70"
        >
          <h2 className="text-2xl font-semibold mb-6">Outpass Details</h2>
          <p className="mb-4"><strong>Name:</strong> {user.visitorName}</p>
          <p className="mb-4"><strong>Contact:</strong> {user.visitorContact}</p>
          <p className="mb-4"><strong>Email:</strong> {user.visitoremail}</p>
          <p className="mb-4"><strong>From:</strong> {new Date(selectedOutpass.fromTime).toLocaleString()}</p>
          <p className="mb-4"><strong>To:</strong> {new Date(selectedOutpass.toTime).toLocaleString()}</p>
          <p className="mb-4"><strong>Reason:</strong> {selectedOutpass.reason}</p>
          <p className="mb-4">
            <strong>Status:</strong>{" "}
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold uppercase ${
                selectedOutpass.status === "approved"
                  ? "bg-green-600 text-green-100"
                  : selectedOutpass.status === "pending"
                  ? "bg-yellow-500 text-yellow-900"
                  : "bg-red-600 text-red-100"
              }`}
            >
              {selectedOutpass.status}
            </span>
          </p>
          <button
            onClick={() => setSelectedOutpass(null)}
            className="bg-red-600 hover:bg-red-700 p-3 rounded-lg w-full transition-transform transform hover:scale-105"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

export default VisitorDashboard;
