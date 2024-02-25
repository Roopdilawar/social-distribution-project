import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';

import { posts, Post } from  '../timeline/index.js'; 

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
    const [user, setUser] = useState({
        name: 'scorpion',
        fullName: 'Justin Fuddu',
        followers: 150,
        following: 75,
        posts: [],
        bio: 'The only way out is through.'
    });
    const [open, setOpen] = useState(false);
    const [bio, setBio] = useState(user.bio);

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

    // New states for modals
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    // Functions to handle modal open/close
    const handleFollowersOpen = () => setShowFollowers(true);
    const handleFollowersClose = () => setShowFollowers(false);
    const handleFollowingOpen = () => setShowFollowing(true);
    const handleFollowingClose = () => setShowFollowing(false);

    // Modal style
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
                <Avatar src="https://i.pinimg.com/originals/9c/90/be/9c90be4949b0f0a02b404481f6adc347.jpg" sx={{ width: 200, height: 200, borderRadius: '50%' }} />
                <Typography component="h1" variant="h5" sx={{
                    fontSize: '2.25em',
                    marginTop: 1,
                    fontFamily:'Garamond',
                    fontWeight: 'bold',
                }}>
                    {user.fullName}
                </Typography>
                <div style={{ marginTop: '20px' }} />
                <Box sx={{ marginTop: 1, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{
                    fontSize: '1em',
                    marginTop: 1,
                    fontFamily: 'Futura', 
                    fontWeight: 'italica',
                    }}>
                        {user.bio}
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

                {/* Followers and Following buttons with onClick handlers */}
                <Grid container spacing={4} justifyContent="center">
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, '&:hover': { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', cursor: 'pointer' } }} onClick={handleFollowingOpen}>
                            following: {user.following}
                        </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, '&:hover': { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', cursor: 'pointer' } }} onClick={handleFollowersOpen}>
                            followers: {user.followers}
                        </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2 }} >
                            posts: {user.posts.length}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Followers Modal */}
                <Modal open={showFollowers} onClose={handleFollowersClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Followers</Typography>
                        {/* Render followers list here */}
                    </Box>
                </Modal>

                {/* Following Modal */}
                <Modal open={showFollowing} onClose={handleFollowingClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Following</Typography>
                        {/* Render following list here */}
                    </Box>
                </Modal>        

                <div style={{ marginTop: '40px' }} />
                <div style={{ maxWidth: '600px', margin: 'auto' }}>
                    {posts.map(post => (
                        <Post key={post.id} post={post} />
                    ))}
                </div>
            </Box>
        </Container>
    </ThemeProvider>
);
};


export default UserProfile;