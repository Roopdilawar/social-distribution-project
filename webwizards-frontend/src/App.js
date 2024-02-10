import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/signin/index.js'; 
import SignUp from './pages/signup/index.js'; 
import './App.css';
import TimelinePage from './pages/timeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="top-nav">
          <h1 className="header-title">SocialDistribution</h1>
          <nav>
            <button className="nav-button">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className="nav-button">
              <FontAwesomeIcon icon={faUser} />
            </button>
          </nav>
        </header>

        <Routes>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="/" element={<TimelinePage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;