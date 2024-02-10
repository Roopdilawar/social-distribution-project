import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/signin/index.js'; 
import SignUp from './pages/signup/index.js'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;