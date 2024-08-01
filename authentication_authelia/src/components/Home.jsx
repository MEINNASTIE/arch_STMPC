import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt'); 
    navigate('/login'); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to My Auth App</h1>
        <p className="text-lg text-gray-600">You are logged in!</p>
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
