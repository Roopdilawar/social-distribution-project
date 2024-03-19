import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import axios from 'axios';
import { TimelinePost } from '../../components/timeline-post/index.js';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { Paper, ButtonBase } from '@mui/material';
import { useTheme } from '../../components/theme-context/index.js';
import LightModeIcon from '@mui/icons-material/LightMode'; 
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { styled } from '@mui/system';


const ThemeSwitchButton = styled(IconButton)(({ theme }) => ({
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.short,
    }),
    transform: 'rotate(0deg)',
    '&:hover': {
      backgroundColor: 'transparent',
      transform: 'rotate(360deg)',
    },
  }));  

export function UserProfile() {
    const [user, setUser] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [editBioOpen, setEditBioOpen] = useState(false);
    const [editProfilePicOpen, setEditProfilePicOpen] = useState(false);
    const [newBio, setNewBio] = useState(''); 
    const [currentBio, setCurrentBio] = useState('');
    const [currentProfilePic, setCurrentProfilePic] = useState('');
    const [newProfilePic, setNewProfilePic] = useState('');
    const [userId, setUserId] = useState(null);
    const [posts, setPosts] = useState([]);
    const { themeMode, toggleTheme } = useTheme();

    const fetchUserBio = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/user-bio/', {
            headers: {
                'Authorization': `Token ${token}`
            }
            });
            setCurrentBio(response.data.user_bio);
            setNewBio(response.data.user_bio);
            
        } catch (error) {
            console.error("Error fetching user ID: ", error);
        }
    };

    const fetchUserProfilePic = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/user-profile-picture/', {
            headers: {
                'Authorization': `Token ${token}`
            }
            });
            setCurrentProfilePic(response.data.user_profile_picture);            
        } catch (error) {
            console.error("Error fetching user ID: ", error);
        }
    };

    useEffect(() => {
        const fetchUserId = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/get-user-id/', {
            headers: {
                'Authorization': `Token ${token}`
            }
            });
            setUserId(response.data.user_id);
        } catch (error) {
            console.error("Error fetching user ID: ", error);
        }
        };

        fetchUserId();
        fetchUserBio();
        
        fetchUserProfilePic();
    }, []);

    const fetchAuthors = async () => {
        if (!userId) return; 
        try {
            const response = await axios.get('http://localhost:8000/api/authors/' + userId + '/');
            setAuthors(response.data); 
        } catch (error) {
            console.error("Error fetching authors: ", error);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, [userId]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/authors/${userId}/posts/`);
                console.log(response.data)
                const allPosts = response.data;
    
                const userPosts = allPosts.filter(post => {
                    const authorId = post.author.id.split('/').pop();
                    const userIdString = userId ? userId.toString() : ''; 
                    
                    return authorId === userIdString; 
                });
    
                if (userPosts.length === 0) {
                    console.log('No posts found for this user.');
                    setPosts([]); 
                } else {
                    const orderedPosts = userPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    setPosts(orderedPosts);
                }
                
            } catch (error) {
                console.error("Error fetching posts: ", error);
            }
        };
        fetchPosts();
        const intervalId = setInterval(fetchPosts, 1000);
        return () => clearInterval(intervalId);
    }, [userId]);     

    const handleOpen = () => {
        setEditBioOpen(true);
    };

    const handleClose = () => {
        setEditBioOpen(false);
        setNewBio(currentBio);
    };

    const handleCloseEditProfilePic = () => {
        setEditProfilePicOpen(false);
        setNewProfilePic('');
    }

    const handleBioChange = (event) => {
        setNewBio(event.target.value);
    };

    const updateBio = async () => {
        const updatedBioData = {
            bio: newBio
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }

        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            const response = await axios.put('http://localhost:8000/api/user-bio/', updatedBioData, config);
            fetchUserBio();
            setEditBioOpen(false);
        } catch (error) {
            console.error("Error fetching user ID: ", error);
        }
    }

    const updateProfilePic = async () => {
        const updatedProfilePicData = {
            profile_picture: newProfilePic
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }

        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            const response = await axios.put('http://localhost:8000/api/user-profile-picture/', updatedProfilePicData, config);
            fetchUserProfilePic();
            setEditProfilePicOpen(false);
        } catch (error) {
            console.error("Error fetching user ID: ", error);
        }
    }

    const [isFollowing, setIsFollowing] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    const handleFollowingOpen = () => setShowFollowing(true);
    const handleFollowingClose = () => setShowFollowing(false);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };    
    
    const modalStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
    };

    return (
        <Box sx={{ pt: 8 }}>
            <Container component="main">
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 2,
                    marginBottom: 2,
                }}>
                <Box sx={{ position: 'fixed', top: 60, right: 0, m: 2, zIndex: 1301 }}>
                        <ThemeSwitchButton onClick={toggleTheme} color="inherit">
                            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                        </ThemeSwitchButton>
                </Box>
                <Avatar src={currentProfilePic} sx={{ width: 200, height: 200, borderRadius: '50%' }} onClick={() => setEditProfilePicOpen(true)}/>
                <Dialog open={editProfilePicOpen} onClose={handleCloseEditProfilePic}>
                    <DialogTitle>Edit Profile Picture</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You can update your profile picture here.
                        </DialogContentText>
                        <Button
                        variant="contained"
                        component="label"
                        sx={{ mt: 2 }}
                        >
                            Upload Image
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        </Button>
                        {newProfilePic && (
                            <img
                                src={newProfilePic}
                                alt="Uploaded"
                                style={{ maxWidth: '100%', marginTop: '20px' }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditProfilePic}>Cancel</Button>
                        <Button onClick={updateProfilePic}>Save</Button>
                    </DialogActions>
                </Dialog>
                <Typography component="h1" variant="h5" sx={{
                    fontSize: '2.25em',
                    marginTop: 1,
                    fontFamily:'roboto',
                    fontWeight: '1000',
                }}>
                    {authors.displayName}
                </Typography>
                <div style={{ marginTop: '20px' }} />


                <Box sx={{ marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Typography variant="body1" sx={{
                    fontSize: '1em',
                    fontFamily: 'Roboto', 
                }}>
                    {currentBio}
                </Typography>
                <IconButton aria-label="edit" size="small" onClick={handleOpen} sx={{ ml: 1 }}>
                    <EditIcon fontSize="inherit" />
                </IconButton>

                </Box>


                <Dialog open={editBioOpen} onClose={handleClose}>
                <DialogTitle>Edit Bio</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can update your bio information here.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="bio"
                        label="Bio"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newBio}
                        onChange={handleBioChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={updateBio}>Save</Button>
                </DialogActions>
            </Dialog>

                <div style={{ marginTop: '40px' }} />

                <Grid container spacing={4} justifyContent="center">
                <Grid item>
                    <ButtonBase onClick={handleFollowingOpen} style={{ borderRadius: '4px' }}>
                    <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold', 
                        mx: 2, 
                        display: 'inline-block', 
                        p: 1, 
                        borderRadius: '4px', 
                        '&:hover': { 
                            boxShadow: '0 2px 5px 2px rgba(0, 0, 0, 0.2)', 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        } 
                        }}>
                        Following: {'4'}
                    </Typography>
                    </ButtonBase>
                </Grid>
                <Grid item>
                    <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold', 
                        mx: 2, 
                        display: 'inline-block', 
                        p: 1, 
                        borderRadius: '4px', 
                        backgroundColor: 'rgba(0, 0, 0, 0)', 
                        boxShadow: 'none', 
                        '&:hover': { 
                        boxShadow: 'none', 
                        } 
                    }}>
                    Posts: {posts.length}
                    </Typography>
                </Grid>
                </Grid>


                <Modal open={showFollowing} onClose={handleFollowingClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Following</Typography>
                    </Box>
                </Modal>        

                <div style={{ marginTop: '40px' }} />
                <div style={{ maxWidth: '1000px', width: '100%', margin: 'auto' }}>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <TimelinePost key={post.id} post={post} isViewOnly={false}/>
                        ))
                    ) : (
                        <Typography variant="subtitle1" style={{ textAlign: 'center' }}>
                            No posts found!
                        </Typography>
                    )}
                </div>
            </Box>
        </Container>
        </Box>
);
};


export default UserProfile;