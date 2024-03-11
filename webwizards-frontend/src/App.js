import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; 
import './App.css';
import UserProfile from './pages/profile/index.js';
import SignIn from './pages/signin/index.js';
import SignUp from './pages/signup/index.js';
import TimelinePage from './pages/timeline';
import NewPost from './pages/postcreation/index.js';
import PostViewPage from './pages/postview/index.js';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './components/theme-context/index.js'; 
import Tooltip from '@mui/material/Tooltip';


function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token && location.pathname !== '/signin' && location.pathname !== '/signup') {
      navigate('/signin');
    }
    if (location.pathname === '/signin' && token) {
      navigate('/');
    }
  }, [navigate, location.pathname]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleProfileClick = () => {
    navigate('profile'); 
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/signin'); 
  };

  return (
    <ThemeProvider>
      <CssBaseline /> 
      <div className="App">
      <AppBar position="fixed" sx={{
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'none',
        color: 'rgba(0, 0, 0, 0.7)',
      }}>
  <Toolbar>
    <Box
      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
      onClick={handleLogoClick}
    >
      <img src="https://imgur.com/KX0kfY9.png" alt="Logo" style={{ height: '40px', marginRight: '0px' }} />
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 'bold',
          color: '#FFFFFF',
          fontFamily: 'Lexend',
          textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
        }}
      >
        SocialDistribution
      </Typography>
    </Box>
    {!isAuthPage && (
      <>
        <Tooltip title="Add Post">
          <IconButton color="inherit" className="navbar-icon" onClick={toggleModal}>
            <AddBoxIcon />
          </IconButton>
        </Tooltip>
        <NewPost isOpen={isModalOpen} className="navbar-icon" handleClose={toggleModal} />
        <Tooltip title="Notifications">
          <IconButton color="inherit" className="navbar-icon">
            <NotificationsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Profile">
          <IconButton color="inherit" className="navbar-icon" onClick={handleProfileClick}>
            <AccountCircle />
          </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton color="inherit" className="navbar-icon" onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      </>
    )}
  </Toolbar>
</AppBar>


      <Routes>
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="/" element={<TimelinePage />} />
        <Route path="/posts/:postId" element={<PostViewPage/>} />
        <Route path="profile" element={<UserProfile />} />
      </Routes>
    </div>
  </ThemeProvider>
);
}

export default App;
