import { useAuth } from 'contexts/AuthContext';

export const useApi = () => {
  const { getDecryptedToken } = useAuth();

  const apiRequest = async (url, options = {}) => {
    const token = getDecryptedToken();
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, { 
      ...options, 
      headers,
      credentials: 'include',
      mode: 'cors'
    });
  };

  return { apiRequest };
}; 