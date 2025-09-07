import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, WithAuth, WithoutAuth } from './contexts/AuthContext';
import DashboardPage from './pages/DashboardPage';
import { GamesPage } from './pages/GamesPage';
import { GameTeamsPage } from './pages/GameTeamsPage';
import LoginPage from './pages/LoginPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { ScoreInputPage } from './pages/ScoreInputPage';
import './styles/auth.css';
import './styles/file-upload.css';
import './styles/forms.css';
import './styles/game-teams.css';
import './styles/score-input.css';
import './styles/scoreboard.css';
import './styles/team-components.css';
import './styles/ui-components.css';

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

            <Route
              path="/games/:id/teams"
              element={
                <WithAuth>
                  <GameTeamsPage />
                </WithAuth>
              }
            />

            <Route
              path="/games/:gameId/scores"
              element={
                <WithAuth>
                  <ScoreInputPage />
                </WithAuth>
              }
            />

            <Route
              path="/games/:gameId/scoreboard"
              element={
                <WithAuth>
                  <ScoreboardPage />
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
