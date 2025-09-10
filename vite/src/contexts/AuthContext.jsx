import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const secretKey = "9rqD*1:fzOi4<</mj2Hk%*6\\Yd!:£'";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [username, setUsername] = useState(sessionStorage.getItem('username') || null);
  const [roles, setRoles] = useState(() => {
    const stored = sessionStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }, [token]);

  const login = useCallback((newToken, newUsername, newRoles) => {
    setToken(newToken);
    setUsername(newUsername);
    setRoles(newRoles);
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('username', newUsername);
    sessionStorage.setItem('roles', JSON.stringify(newRoles));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsername(null);
    setRoles([]);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('roles');
  }, []);

  const getToken = useCallback(() => {
    return token;
  }, [token]);

  const getDecryptedToken = useCallback(() => {
    if (token) {
      const bytes = CryptoJS.AES.decrypt(token, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token,
      username,
      roles,
      login,
      logout,
      getToken,
      getDecryptedToken,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 