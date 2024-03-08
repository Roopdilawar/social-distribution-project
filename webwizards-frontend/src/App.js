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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; 


const theme = createTheme({
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

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
    <ThemeProvider theme={theme}>
    <CssBaseline /> 
    <div className="App">
      <AppBar position="fixed" sx={{
        backgroundColor: 'rgba(255,255,255,0.2)', 
        backdropFilter: 'blur(10px)', 
        boxShadow: 'none', 
        color: 'rgba(0, 0, 0, 0.7)', 
        '&::before': { 
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(25, 118, 210, 0.9)', 
          borderRadius: '4px', 
          zIndex: -1,
        },
      }}>
    <Toolbar>
      <Box 
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }} 
        onClick={handleLogoClick}
      >
        <img src="https://imgur.com/KX0kfY9.png" alt="Logo" style={{ height: '40px' }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            marginLeft: '0px', 
            fontWeight: '800',
            color: '#FFFFFF', 
            fontFamily: 'Lexend',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)' 
          }}            
        >
          SocialDistribution
        </Typography>
      </Box>
      {!isAuthPage && (
        <>
          <IconButton color="inherit" onClick={toggleModal}>
            <AddBoxIcon />
          </IconButton>
          <NewPost isOpen={isModalOpen} handleClose={toggleModal} />
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleProfileClick}>
            <AccountCircle />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
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
