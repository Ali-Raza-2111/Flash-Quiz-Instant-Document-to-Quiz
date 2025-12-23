import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, signup as signupApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage on load
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to validate the token or fetch user details here
      setUser({ token }); 
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('token', data.access_token);
      setUser({ token: data.access_token });
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupApi(name, email, password);
      // Automatically login after signup or redirect to login
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
