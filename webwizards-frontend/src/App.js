import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Chip, InputBase, Button, Modal, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; 
import SearchIcon from '@mui/icons-material/Search';
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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [filteredUsersData, setFilteredUsersData] = useState([]);
  const [serverCredentials, setServerCredentials] = useState([]);
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

    const fetchServerCredentials = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/server-credentials/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setServerCredentials(response.data);
        } catch (error) {
            console.error("Error fetching server credentials:", error);
        }
    }; 

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

  const handleNavSearch = () => {
    fetchServerCredentials();
    setUsersData([]);
    setFilteredUsersData([]);

    const fetchAllUsers = async () => {
        try {
            for (let [serverUrl, credentials] of Object.entries(serverCredentials)) {
                let url = serverUrl + `api/authors/`;    
                while (url){
                    const response = await axios.get(url, {
                      auth: {
                          username: credentials.outgoing_username,
                          password: credentials.outgoing_password,
                      }
                    });
                    url = response.data.next;
                    setUsersData(prevUsers => [...prevUsers, ...response.data.items]);
                    setFilteredUsersData(prevUsers => [...prevUsers, ...response.data.items]);
                    setOpenModal(true);
                }
                   
            }
        }
        catch (error) {
            console.log(error);
        }

    }

    fetchAllUsers();

  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = usersData.filter(author => author.displayName.toLowerCase().includes(query.toLowerCase()));
    setFilteredUsersData(filtered);
  };

  const handleClickingSearchedUser = (author_info) => {
    const id = author_info.id.split('/').pop();
    navigate(`/friend-profile/${id}`, { state: { author_info } });
    setOpenModal(false);
  };

  const getHostTag = (host) => {
    let tag = { text: 'Local', color: 'dark-grey' };
    if (host.includes('deadly-bird')) {
        tag = { text: 'Deadly-Bird', color: 'red' };
    } else if (host.includes('y-com')) {
        tag = { text: 'Y.com', color: 'blue' };
    } else if (host.includes('espresso')) {
        tag = { text: 'Espresso', color: 'brown' };
    }
    return tag;
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
    {/* style={{maxHeight: '500px', overflowY: 'auto'}} */}
    {!isAuthPage && (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton style= {{margin: '0px'}} variant="text" color="inherit" onClick={handleNavSearch}><SearchIcon/></IconButton>
        </Box>
        <Modal
  open={openModal}
  onClose={() => setOpenModal(false)}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>   
  <Box
      sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '80%', md: '50%' },
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
          maxHeight: '80%',
      }}
  >
      <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center" marginBottom={2}>
          Search for Users
      </Typography>
      
      <Box
          sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
          }}
      >
          <TextField
              fullWidth
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              sx={{ mr: 1, flex: 1 }}
          />
          <IconButton color="primary" ><SearchIcon /></IconButton>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredUsersData.length > 0 ? filteredUsersData.map((author) => (
              <ListItem 
                  alignItems="flex-start" 
                  key={author.id} 
                  onClick={() => handleClickingSearchedUser(author)}
                  sx={{ '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer', borderRadius: '4px', mb: 1 }}
              >
                  <ListItemAvatar>
                      <Avatar src={author.profileImage} alt={author.displayName}/>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Box sx={{ display: 'flex', alignItems: 'center' }}>{author.displayName}</Box>}
                    secondary={<Chip label={getHostTag(author.host).text} size="small" style={{ backgroundColor: getHostTag(author.host).color, color: 'white', marginLeft: '0px' }} />}
                  />
              </ListItem>
          )) : (
              <Typography textAlign="center" color="text.secondary">
                  No users found
              </Typography>
          )}
      </List>
  </Box>
</Modal>

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
          <Route path="/posts/:postId/:authorId/:host" element={<PostViewPage/>} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="inbox" element={<NotificationsPage />} />
          <Route path="/friend-profile/:id" element={<UserProfileViewOnly />} />
        </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  </ThemeProvider>
);
}

export default App;
