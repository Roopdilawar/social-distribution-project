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
                console.log(response)
                setAuthors(response.data); 
            } catch (error) {
                console.error("Error fetching authors: ", error);
            }
        };
        fetchAuthors();
    }, [userId]);

    console.log(authors)
    
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/posts/');
                
                const allPosts = response.data.items;
    
                const userPosts = allPosts.filter(post => {
                    const authorId = post.author.id.split('/').pop();
                    const userIdString = userId.toString();
                    
                    return authorId === userIdString; 
                });
    
                console.log("List length:", userPosts);

                if (userPosts.length === 0) {
                    console.log('No posts found for this user.');
                    setPosts(null); 
                } else {
                    const orderedPosts = userPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    setPosts(orderedPosts);
                }
            } catch (error) {
                console.error("Error fetching posts: ", error);
            }
        };
    
        fetchPosts();
    }, ); 
    

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
                    fontFamily:'Georgia',
                    fontWeight: 'bold',
                }}>
                    {authors.displayName}
                </Typography>
                <div style={{ marginTop: '20px' }} />
                <Box sx={{ marginTop: 1, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{
                    fontSize: '1em',
                    marginTop: 1,
                    fontFamily: 'Futura', 
                    fontWeight: 'italica',
                    }}>
                        {"User Bio Here!"}
                    </Typography>
                    <Button variant="outlined" onClick={handleOpen} sx={{ marginTop: 1, marginBottom: 2 }}>
                        Edit Bio
                    </Button>
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, '&:hover': { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', cursor: 'pointer' } }} onClick={handleFollowingOpen}>
                            Following: {'4'}
                        </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, '&:hover': { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', cursor: 'pointer' } }} onClick={handleFollowersOpen}>
                            Followers: {'4'}
                        </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2 }} >
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
                {posts ? (
                    posts.map(post => (
                        <TimelinePost key={post.id} post={post} />
                    ))
                ) : (
                    <p>No posts found.</p>
                )}
            </div>
            </Box>
        </Container>
    </ThemeProvider>
);
};


export default UserProfile;