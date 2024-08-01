import React, { useEffect, useState } from 'react';

const Protected = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('jwt');
      const response = await fetch('http://localhost:5000/protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setMessage('Access denied');
      }
    };

    fetchProtectedData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Protected Content</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Protected;
