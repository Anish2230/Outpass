import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VisitorLogin() {
  const [section, setSection] = useState('login');
  const [visitorName, setVisitorName] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [visitoremail, setVisitorEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { loginvisitor, fetcVisitordata } = useAuth();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

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

  const handleSectionToggle = (sectionName) => {
    setSection(sectionName);
    setError('');
    setOtpSent(false);
  };

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
        <div className="mb-4 flex">
          <button
            onClick={() => handleSectionToggle('login')}
            className={`w-1/2 p-2 rounded-lg font-semibold mr-5 ${
              section === 'login'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/50'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => handleSectionToggle('register')}
            className={`w-1/2 p-2 rounded-lg font-semibold ${
              section === 'register'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/50'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        {section === 'login' ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const response = await fetch(`${apiUrl}/api/visitor/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitoremail, password }),
              });
              if (!response.ok) throw new Error();
              const data = await response.json();
              localStorage.setItem('token-visitor', data.token);
              loginvisitor(data.visitor);
              navigate('/visitor/dashboard');
            } catch {
              setError('Invalid email or password. Please try again.');
            }
          }}>
            <h1 className="text-3xl font-bold text-center mb-6 text-white">Visitor Login</h1>
            <input
              type="email"
              placeholder="Enter your email"
              value={visitoremail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:-translate-y-1"
            >
              Login
            </button>
          </form>
        ) : !otpSent ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              // check existence and send OTP
              const visitorCheckResponse = await fetch(`${apiUrl}/api/visitor/check-existence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitoremail }),
              });
              const visitorCheckData = await visitorCheckResponse.json();
              if (visitorCheckData.exists) {
                setError('Visitor already exists. Please login.');
                return;
              }
              const otpResponse = await fetch(`${apiUrl}/api/visitor/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitoremail }),
              });
              if (!otpResponse.ok) throw new Error();
              setOtpSent(true);
              setError('');
            } catch {
              setError('Error sending OTP. Please try again.');
            }
          }}>
            <h1 className="text-3xl font-bold text-center mb-6 text-white">Register</h1>
            <input
              type="text"
              placeholder="Enter your name"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="text"
              placeholder="Enter your contact number"
              value={visitorContact}
              onChange={(e) => setVisitorContact(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={visitoremail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:-translate-y-1"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
              setError('Passwords do not match.');
              return;
            }
            try {
              const response = await fetch(`${apiUrl}/api/visitor/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorName, visitoremail, otp, password, visitorContact }),
              });
              if (!response.ok) throw new Error();
              const data = await response.json();
              localStorage.setItem('token-visitor', data.token);
              loginvisitor(data.visitor);
              navigate('/visitor/dashboard');
            } catch {
              setError('Invalid OTP or other registration error. Please try again.');
            }
          }}>
            <h1 className="text-3xl font-bold text-center mb-6 text-white">Verify OTP</h1>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:-translate-y-1"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const otpResponse = await fetch(`${apiUrl}/api/visitor/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visitoremail }),
                  });
                  if (!otpResponse.ok) throw new Error();
                  setError('OTP resent successfully.');
                } catch {
                  setError('Error resending OTP. Please try again.');
                }
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl shadow-md mt-2 transition"
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            to="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VisitorLogin;
