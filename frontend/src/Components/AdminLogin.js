import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isadminauthenticated, adminuser, fetchAdmindata } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token-admin');
    const fetchadmindata = async () => {
      if (!token) {
        navigate('/admin');
      } else {
        try {
          await fetchAdmindata(token);
          navigate('/admin/dashboard');
        } catch (error) {
          console.error('Error fetching admin data:', error);
          navigate('/admin');
        }
      }
    };

    fetchadmindata();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data = await response.json();
      localStorage.setItem('token-admin', data.token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      alert('Refer ayush121314 Github outpass repository to get id and password');
    }
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
        <h2 className="text-3xl font-bold text-center text-white mb-8 relative inline-block ml-20 ">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-white font-semibold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-white font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:-translate-y-1"
          >
            Login
          </button>
        </form>

        {/* Back to Home Button */}
        <div className="mt-6 text-center">
          <Link to="/">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
