import { Link } from 'react-router-dom';  // Import Link for navigation

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable";
Modal.setAppElement("#root");

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOutpass, setSelectedOutpass] = useState(null);
  const [profileView, setProfileView] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchOutpassHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiUrl}/api/student/outpass-history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setOutpassRequests(data.outpasses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOutpassHistory();
  }, [apiUrl]);

  const generatePDF = (user, outpasses) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Outpass Summary", 14, 22);

    doc.setFontSize(12);
    doc.text(`Name: ${user.name}`, 14, 32);
    doc.text(`Email: ${user.email}`, 14, 38);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);

    const tableColumn = ["From Time", "To Time", "Reason", "Status"];
    const tableRows = [];

    outpasses.forEach(op => {
      const row = [
        new Date(op.fromTime).toLocaleString(),
        new Date(op.toTime).toLocaleString(),
        op.reason,
        op.status,
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.save("Outpass_Summary.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the 'From Time' and 'To Time'
    if (new Date(fromTime) >= new Date(toTime)) {
      setError("From time must be earlier than To time.");
      return;
    }
  };

  const approvedOutpasses = outpassRequests.filter(op => op.status === "approved");
  const pendingOutpasses = outpassRequests.filter(op => op.status === "pending");
  const pastOutpasses = outpassRequests.filter(op => new Date(op.toTime) < new Date());

  const renderOutpassList = () => {
    let outpasses = [];
    let label = "";

    switch (activeTab) {
      case "approved":
        outpasses = approvedOutpasses;
        label = "Approved Outpasses";
        break;
      case "pending":
        outpasses = pendingOutpasses;
        label = "Pending Outpasses";
        break;
      case "past":
        outpasses = pastOutpasses;
        label = "Past Outpasses";
        break;
      default:
        break;
    }

    return (
      <div>
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">{label}</h3>
        <div className="h-72 overflow-y-auto space-y-4">
          {outpasses.length > 0 ? (
            outpasses.map((outpass) => (
              <div
                key={outpass.id}
                className="bg-white p-5 rounded-xl shadow-lg border border-indigo-200 hover:shadow-2xl transition duration-300"
              >
                <p><strong>From:</strong> {new Date(outpass.fromTime).toLocaleString()}</p>
                <p><strong>To:</strong> {new Date(outpass.toTime).toLocaleString()}</p>
                <p><strong>Reason:</strong> {outpass.reason}</p>
                <p className="mt-1">
                  <strong>Status:</strong>{" "}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
                    outpass.status === "approved"
                      ? "bg-green-300 text-green-900"
                      : outpass.status === "pending"
                      ? "bg-yellow-300 text-yellow-900"
                      : "bg-red-300 text-red-900"
                  }`}>
                    {outpass.status}
                  </span>
                </p>
                <div className="flex justify-end gap-4 mt-3">
                  <button
                    onClick={() => setSelectedOutpass(outpass)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => generatePDF(user, [outpass])}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No {label.toLowerCase()}.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-100"
      style={{
        backgroundImage: `url('https://images.careerindia.com/college-photos/8668/lnmiitj-campus-2_1463030478.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center -50px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-gray-900 bg-opacity-90 rounded-xl shadow-[0_0_15px_5px_rgba(99,102,241,0.7)] p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto text-white">
        <div className="bg-indigo-600 text-white py-4 px-8 rounded-lg text-center shadow-md mb-8">
          <h1 className="text-3xl font-extrabold">Welcome, {user?.name}</h1>
        </div>

        {/* Header Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-5 mb-8">
          <button
            onClick={() => setProfileView(!profileView)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full transition"
          >
            {profileView ? "Hide Profile" : "Show Profile"}
          </button>

          <Link to="/">
            <button className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded-full transition">
              Back to Home
            </button>
          </Link>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Section */}
        {profileView && (
          <div className="bg-indigo-50 p-6 rounded-lg shadow-md mb-8 border border-indigo-200">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-5">Profile</h2>
            <p className="mb-2 text-black"><strong>Name:</strong> {user?.name}</p>
            <p className="mb-2 text-black"><strong>Email:</strong> {user?.email}</p>
            <p className="mb-2 text-black"><strong>Rollno:</strong> {user?.Rollno}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Outpass Form */}
          <div className="bg-indigo-50 p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Request Outpass</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium text-indigo-700 mb-2">From Time</label>
                <input
                  type="datetime-local"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full border border-indigo-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-indigo-700 mb-2">To Time</label>
                <input
                  type="datetime-local"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full border border-indigo-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-indigo-700 mb-2">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) setReason(e.target.value);
                  }}
                  className="w-full border border-indigo-300 p-3 rounded-lg resize-none"
                  rows="3"
                  required
                />
                <p className="text-sm text-indigo-500 mt-1">{30 - reason.length} characters remaining</p>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {successMessage && <p className="text-green-700 text-sm">{successMessage}</p>}

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 w-full text-white py-3 rounded-full font-semibold transition"
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* Status Viewer */}
          <div className="bg-indigo-50 p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Entrypass Status</h2>
            <div className="flex justify-between mb-6">
              {["pending", "approved", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 w-full rounded-full mx-2 transition ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-200 hover:bg-indigo-300 text-indigo-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {renderOutpassList()}
          </div>
        </div>

        {/* Modal remains unchanged */}
        {selectedOutpass && (
          <Modal
            isOpen={!!selectedOutpass}
            onRequestClose={() => setSelectedOutpass(null)}
            className="bg-white p-8 rounded-xl max-w-xl mx-auto mt-24 shadow-2xl"
            overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center"
          >
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Outpass Details</h2>
            <p className="mb-2"><strong>Name:</strong> {user.name}</p>
            <p className="mb-2"><strong>Rollno:</strong> {user.Rollno}</p>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>From:</strong> {new Date(selectedOutpass.fromTime).toLocaleString()}</p>
            <p className="mb-2"><strong>To:</strong> {new Date(selectedOutpass.toTime).toLocaleString()}</p>
            <p className="mb-6"><strong>Reason:</strong> {selectedOutpass.reason}</p>
            <p className="mb-6"><strong>Status:</strong> {selectedOutpass.status}</p>

            <button
              onClick={() => setSelectedOutpass(null)}
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 w-full rounded-full font-semibold transition"
            >
              Close
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
