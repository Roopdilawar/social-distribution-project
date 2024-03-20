import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { Paper, ButtonBase } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Button, Box, Container, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { Modal, List, ListItem, ListItemText } from '@mui/material';
import { useTheme } from '../../components/theme-context';
import { TimelinePost } from '../../components/timeline-post/index.js';

export function UserProfileViewOnly() {
    const location = useLocation();
    const author_info = location.state?.author_info;

    let { id } = useParams();
    const [currentBio, setCurrentBio] = useState('');
    const [currentProfilePic, setCurrentProfilePic] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [posts, setPosts] = useState([]);
    const { themeMode } = useTheme();
    const [isFollowing, setIsFollowing] = useState(false);
    const [userId, setUserId] = useState(null);
    const [followers, setFollowers] = useState({ items: [] });

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                return;
            }
            const headers = { 'Authorization': `Token ${token}` };

            try {
                const userResponse = await axios.get('http://localhost:8000/api/get-user-id/', { headers });
                const userId = userResponse.data.user_id;
                setUserId(userId);
                
                setCurrentProfilePic(author_info.profileImage);
                setDisplayName(author_info.displayName);

                const postsResponse = await axios.get(`http://localhost:8000/api/authors/${id}/posts/`, { headers });
                const publicPosts = postsResponse.data.filter(post => post.visibility === "PUBLIC");
                setPosts(publicPosts.sort((a, b) => new Date(b.published) - new Date(a.published)));

                const followersResponse = await axios.get(`http://localhost:8000/api/authors/${id}/followers/`, { headers });
                const isUserFollowing = followersResponse.data.items.some(follower => parseInt(follower.id.split('/').pop()) === userId);
                setIsFollowing(isUserFollowing);
            } catch (error) {
                console.error("Error fetching data: ", error.response?.data || error.message);
            }
        };

        fetchInitialData();
        fetchFollowers();
    }, [id]);

    const fetchFollowers = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/authors/${id}/followers/`);
            setFollowers(response.data);
            console.log('Number of followers:', followers.items.length);
            console.log('Followers:', followers.items);
            } 
        catch (error) {
            console.error('Error fetching followers:', error);
            }
    };

    useEffect(() => {
        if (id) {
          fetchFollowers();
        }
      }, [id]);

    const toggleFollow = async () => {
        if (!userId) return; 
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }};
        const data = { "to_follow": author_info };

        try {
            await axios.post(`http://localhost:8000/api/authors/${id}/sendfollowrequest/`, data, config);
            setIsFollowing(true); 
        } catch (error) {
            console.error("Error sending follow request: ", error.response?.data || error.message);
        }
    };


    const [showFollowing, setShowFollowing] = useState(false);

    const handleFollowingOpen = () => setShowFollowing(true);
    const handleFollowingClose = () => setShowFollowing(false);


    const buttonStyles = {
        mt: 2,
        mb: 5,
        borderColor: themeMode === 'dark' ? 'white' : 'black',
        color: themeMode === 'dark' ? 'white' : 'black',
        bgcolor: isFollowing ? 'transparent' : 'rgba(70, 122, 192, 1)',
        '&:hover': {
            backgroundColor: 'transparent',
            borderColor: themeMode === 'dark' ? 'white' : 'black',
            color: themeMode === 'dark' ? 'white' : 'black',
        },
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
                    <Avatar src={currentProfilePic} sx={{ width: 200, height: 200, borderRadius: '50%' }} />
                    <Typography component="h1" variant="h5" sx={{
                        fontSize: '2.25em',
                        marginTop: 1,
                        fontFamily: 'Roboto',
                        fontWeight: '1000',
                    }}>
                        {displayName}

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
                                Followers: {followers.items.length}
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
                            <Typography variant="h6">Followers</Typography>
                            <Box sx={{ overflowY: 'auto', maxHeight: '300px', marginTop: '10px' }}>
                                {followers.items.length > 0 ? (
                                    <List>
                                        {followers.items.map((follower, index) => (
                                            <ListItem key={index}>
                                                {/* Assuming 'name' is an attribute of follower. Adjust as necessary. */}
                                                <ListItemText primary={follower.displayName || 'Unnamed Follower'} />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body1">No followers found.</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Modal>


                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1em', fontFamily: 'Roboto', mt: 2 }}>
                        {currentBio}
                    </Typography>
                    <Button onClick={toggleFollow} variant="outlined" sx={buttonStyles} disabled={isFollowing}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <div style={{ marginTop: '2px', maxWidth: '1000px', width: '100%', margin: 'auto' }}>
                        {posts.length > 0 ? posts.map(post => <TimelinePost key={post.id} post={post} isViewOnly={true} />) : <Typography variant="subtitle1" style={{ textAlign: 'center' }}>No posts found!</Typography>}
                    </div>
                </Box>
            </Container>
        </Box>
    );
}

export default UserProfileViewOnly;
