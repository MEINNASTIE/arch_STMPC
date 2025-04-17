import { createContext, useContext, useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

const secretKey = "9rqD*1:fzOi4<</mj2Hk%*6\Yd!:£'";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [rolename, setRolename] = useState(localStorage.getItem('rolename') || null);

  const login = useCallback((newToken, newUsername, newRolename) => {
    setToken(newToken);
    setUsername(newUsername);
    setRolename(newRolename);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('rolename', newRolename);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsername(null);
    setRolename(null);
    localStorage.removeItem('username');
    localStorage.removeItem('rolename');
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
      rolename,
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