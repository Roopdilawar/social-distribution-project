import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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
        fullName: 'Joe Kennedy',
        followers: 150,
        following: 75,
        posts: [
            { imageUrl: 'https://i.pinimg.com/originals/0f/2a/b4/0f2ab4bd80c38d0246eb062e1b49a7a9.jpg', description: 'Post 1' },
            { imageUrl: 'https://i.pinimg.com/originals/e5/34/04/e53404dd40d5bcea87555af14fd178e0.jpg', description: 'Post 2' },
            { imageUrl: 'https://i.pinimg.com/originals/06/56/3a/06563aa88fa0934dbd0ce1ec6337f661.jpg', description: 'Post 3' },
            { imageUrl: 'https://i.pinimg.com/originals/27/04/28/2704281c28b73fe5e71f8a648fff7bb4.jpg', description: 'Post 4' },
            { imageUrl: 'https://i.pinimg.com/originals/5c/e9/c9/5ce9c9d26480c8c4a84168560752878c.jpg', description: 'Post 5' },
            { imageUrl: 'https://i.pinimg.com/originals/0f/a2/78/0fa278b48a1dd22c5342354f97dd195f.jpg', description: 'Post 6' },
            
        ],
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
                <Box sx={{ marginTop: 2, width: '100%' }}>
                    <Grid container spacing={4} justifyContent="center">
                        {user.posts.map((post, index) => (
                            <Grid item xs={12} sm={6} md={3.5} key={index}>
                                <Paper elevation={3} sx={{ position: 'relative', paddingBottom: '100%' }}>
                                    <img src={post.imageUrl} alt={post.description} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Container>
    </ThemeProvider>
);
}

export default UserProfile;