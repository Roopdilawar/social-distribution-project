import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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


function UserProfile() {
    const [user, setUser] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [open, setOpen] = useState(false); 
    const [bio, setBio] = useState(''); 
    const [userId, setUserId] = useState(null);
    const [posts, setPosts] = useState([]);


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
    }, []);
    useEffect(() => {
        const fetchAuthors = async () => {
            if (!userId) return; 
            try {
                const response = await axios.get('http://localhost:8000/api/authors/' + userId + '/');
                setAuthors(response.data); 
            } catch (error) {
                console.error("Error fetching authors: ", error);
            }
        };
        fetchAuthors();
    }, [userId]);

    
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/posts/');
                
                const allPosts = response.data.items;
    
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
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        setUser({ ...user, bio: bio });
        handleClose();
    };

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const handleFollowersOpen = () => setShowFollowers(true);
    const handleFollowersClose = () => setShowFollowers(false);
    const handleFollowingOpen = () => setShowFollowing(true);
    const handleFollowingClose = () => setShowFollowing(false);

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
        <ThemeProvider theme={createTheme()}>
        <Box sx={{ pt: 8 }}>
        <Container component="main">
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 2,
                marginBottom: 2,
            }}>
                <Avatar src={authors.profileImage} sx={{ width: 200, height: 200, borderRadius: '50%' }} />
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
                    {"User Bio Here!"}
                </Typography>
                <IconButton aria-label="edit" size="small" onClick={handleOpen} sx={{ ml: 1 }}>
                    <EditIcon fontSize="inherit" />
                </IconButton>
                </Box>


                <Dialog open={open} onClose={handleClose}>
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
                        value={bio}
                        onChange={handleBioChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
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
                    <ButtonBase onClick={handleFollowersOpen} style={{ borderRadius: '4px' }}>
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
                        Followers: {'4'}
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

                <Modal open={showFollowers} onClose={handleFollowersClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Followers</Typography>
                    </Box>
                </Modal>

                <Modal open={showFollowing} onClose={handleFollowingClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Following</Typography>
                    </Box>
                </Modal>        

                <div style={{ marginTop: '40px' }} />
                <div style={{ maxWidth: '1000px', width: '100%', margin: 'auto' }}>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <TimelinePost key={post.id} post={post} />
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
    </ThemeProvider>
);
};


export default UserProfile;