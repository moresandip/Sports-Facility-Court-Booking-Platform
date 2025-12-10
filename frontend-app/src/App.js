import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Colorful Navigation */}
        <nav className="colorful-nav">
          <div className="nav-container">
            <div className="nav-logo">
              <h2>🏟️ SportsHub</h2>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                <span className="nav-icon">🏀</span>
                Book Court
              </Link>
              <Link to="/admin" className="nav-link">
                <span className="nav-icon">⚙️</span>
                Admin Dashboard
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>

        {/* Colorful Footer */}
        <footer className="colorful-footer">
          <div className="footer-content">
            <p>&copy; 2024 SportsHub - Your Premier Sports Facility Booking Platform</p>
            <div className="footer-icons">
              <span>🏆</span>
              <span>🎾</span>
              <span>⚽</span>
              <span>🏐</span>
              <span>🏓</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
