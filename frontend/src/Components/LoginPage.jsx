import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div
      className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center -50px',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url('https://images.careerindia.com/college-photos/8668/lnmiitj-campus-2_1463030478.jpg')`,
      }}
    >
      <div
        className="bg-gray-900 bg-opacity-90 rounded-3xl shadow-2xl w-full max-w-md p-10"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8 relative inline-block">
          Sign in to continue
        </h2>

        {/* Student Login */}
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center w-full gap-4 px-6 py-4 mb-6 rounded-xl border-2 border-blue-500 text-blue-400 bg-transparent font-semibold shadow-md hover:shadow-blue-500/70 hover:bg-blue-900 transition transform hover:-translate-y-1"
          type="button"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l6.16-3.422A12.083 12.083 0 0118 10.25C18 13.59 15.31 16.5 12 16.5S6 13.59 6 10.25c0-.383.034-.76.097-1.128L12 14z"
            />
          </svg>
          Login as Student
        </button>

        {/* Admin Login */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center w-full gap-4 px-6 py-4 mb-6 rounded-xl border-2 border-purple-500 text-purple-400 bg-transparent font-semibold shadow-md hover:shadow-purple-500/70 hover:bg-purple-900 transition transform hover:-translate-y-1"
        type="button"
        >
        <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        >
          <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
        </svg>
        Login as Admin
      </button>


        {/* Visitor Login */}
        <button
          onClick={() => navigate('/visitor')}
          className="flex items-center w-full gap-4 px-6 py-4 rounded-xl border-2 border-green-500 text-green-400 bg-transparent font-semibold shadow-md hover:shadow-green-500/70 hover:bg-green-900 transition transform hover:-translate-y-1"
          type="button"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A12.042 12.042 0 0112 15c2.136 0 4.126.56 5.879 1.546M12 12a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
          Login as Visitor
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
