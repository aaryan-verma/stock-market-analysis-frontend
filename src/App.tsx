import { useState } from "react";
import { MemoryRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { authService } from "./services/authService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AboutPage } from "./components/AboutPage";
import { SettingsProvider } from './contexts/SettingsContext';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const handleLogin = async (username: string, password: string) => {
    try {
      await authService.login(username, password);
      setIsAuthenticated(true);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  return (
    <SettingsProvider>
      <Router>
        <Routes>
          <Route 
            path="/auth" 
            element={
              !isAuthenticated ? (
                <LoginPage onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <HomePage onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            } 
          />
          <Route 
            path="/about" 
            element={
              isAuthenticated ? (
                <AboutPage />
              ) : (
                <Navigate to="/auth" />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />
            } 
          />
        </Routes>
      </Router>
      <ToastContainer position="top-right" />
    </SettingsProvider>
  );
}