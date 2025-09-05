import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, WithAuth, WithoutAuth } from './contexts/AuthContext';
import DashboardPage from './pages/DashboardPage';
import { GamesPage } from './pages/GamesPage';
import LoginPage from './pages/LoginPage';
import './styles/auth.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Публичные роуты */}
            <Route
              path="/login"
              element={
                <WithoutAuth>
                  <LoginPage />
                </WithoutAuth>
              }
            />

            {/* Защищенные роуты */}
            <Route
              path="/dashboard"
              element={
                <WithAuth>
                  <DashboardPage />
                </WithAuth>
              }
            />

            <Route
              path="/games"
              element={
                <WithAuth>
                  <GamesPage />
                </WithAuth>
              }
            />

            {/* Перенаправление */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
