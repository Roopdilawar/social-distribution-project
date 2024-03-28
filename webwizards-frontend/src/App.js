import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, InputBase, Button } from '@mui/material';
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
import NotificationsPage from './pages/notifications/index.js';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './components/theme-context/index.js'; 
import Tooltip from '@mui/material/Tooltip';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import UserProfileViewOnly from './pages/friend-profile/index.js';
import axios from 'axios';


function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleNotificationsClick = () => {
    navigate('inbox'); 
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/signin'); 
  };

  const handleSearch = () => {
    // Handle search action
    console.log('Search query:', searchQuery);

    const url = `http://localhost:8000/search-users/?username=${searchQuery}`;
    console.log(url);
    
    axios.get(url, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log(response);
        const userID = response.data[0].id;
        const author_info = response.data[0];
        author_info.displayName = author_info.username;
        console.log(author_info);
        console.log(userID);
        navigate(`/friend-profile/${userID}`, { state: { author_info } });
    })
    .catch(error => {
        alert("User not found! Please check the usrname again!");
        console.log("Error occurred: ", error);
    });

    // then use navigate(`/friend-profile/${id}`, { state: { author_info } });
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

    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <InputBase
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ color: '#FFFFFF', marginRight: '8px' }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
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
          <IconButton color="inherit" className="navbar-icon" onClick={handleNotificationsClick}>
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
  
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        timeout={{ enter: 500, exit: 200 }}
        classNames="fade"
      >
        <Routes>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="/" element={<TimelinePage />} />
          <Route path="/posts/:postId/:authorId" element={<PostViewPage/>} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="friend-profile/:id" element={<UserProfileViewOnly />} />
          <Route path="inbox" element={<NotificationsPage />} />
        </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  </ThemeProvider>
);
}

export default App;
