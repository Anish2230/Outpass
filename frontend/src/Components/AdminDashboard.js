import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Studentadmin } from './Studentadmin';
import { VisitorAdmin } from './VisitorAdmin';

export const AdminDashboard = () => {
  const [mode, setMode] = useState('student'); // Initialize mode as 'student'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-8">
      {/* Container with padding and background gradient, like StudentDashboard */}
      <div className="max-w-5xl mx-auto bg-gray-900 bg-opacity-90 rounded-lg shadow-xl p-6 space-y-6">
        {/* Dark luminous background box with rounded corners and shadow */}
        <div className="flex space-x-4 justify-center">
          {/* Button to select "Student" */}
          <button
            onClick={() => setMode('student')}
            className={`py-2 px-6 font-semibold rounded-full transition-colors duration-300 ${
              mode === 'student' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-indigo-600`}
          >
            Student
          </button>

          {/* Button to select "Visitor" */}
          <button
            onClick={() => setMode('visitor')}
            className={`py-2 px-6 font-semibold rounded-full transition-colors duration-300 ${
              mode === 'visitor' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-indigo-600`}
          >
            Visitor
          </button>
        </div>

        {/* Conditionally render StudentAdmin if mode is 'student' */}
        {mode === 'student' && (
          <div className="mt-6">
            <Studentadmin />
          </div>
        )}

        {/* Conditionally render Visitor content if mode is 'visitor' */}
        {mode === 'visitor' && (
          <div className="mt-6">
            <VisitorAdmin />
          </div>
        )}
      </div>
    </div>
  );
};
