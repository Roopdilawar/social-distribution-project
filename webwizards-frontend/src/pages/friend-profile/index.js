import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { Paper, ButtonBase } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Button, Box, Container, Typography, Grow, CircularProgress } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { Modal, List, ListItem, ListItemText, Pagination } from '@mui/material';
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
    const [serverCredentials, setServerCredentials] = useState([]);
    const [postsPage, setPostsPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchUserId = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('https://social-distribution-95d43f28bb8f.herokuapp.com/api/get-user-id/', {
            headers: {
                'Authorization': `Token ${token}`
            }
            });
            setUserId(response.data.user_id);
        } catch (error) {
            console.error("Error fetching user ID: ", error);
        }
    };

    const fetchServerCredentials = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('https://social-distribution-95d43f28bb8f.herokuapp.com/api/server-credentials/', {
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
        const fetchInitialData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                return;
            }
            
            try {
                if (userId != null) {
                    setCurrentProfilePic(author_info.profileImage);
                    setDisplayName(author_info.displayName);
                    const serverAuth = serverCredentials[author_info.host];

                    let tempPaginationNumber = 1;
                    let morePages = true;
                    let tempPosts= [];
                    
                    while (morePages) {
                        const postsResponse = await axios.get(`${author_info.host}api/authors/${id}/posts/?page=${tempPaginationNumber}`, {
                            auth: {
                                username: serverAuth.outgoing_username,
                                password: serverAuth.outgoing_password
                            }
                        });
                        const filteredPosts = postsResponse.data.items.filter(item => item.type === 'post');
                        const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                        for (let sortedPost of orderedPosts) {
                            tempPosts.push(sortedPost)
                        }
                        if (postsResponse.data.next == null) {
                            morePages = false;
                        }
                        tempPaginationNumber++;
                    }

                    setPosts(tempPosts.sort((a, b) => new Date(b.published) - new Date(a.published)));
                    setLoading(false);

                    const followersResponse = await axios.get(`${author_info.host}api/authors/${id}/followers?size=100`, {
                        auth: {
                            username: serverAuth.outgoing_username,
                            password: serverAuth.outgoing_password
                        }
                    });
                    const isUserFollowing = followersResponse.data.items.some(follower => 
                        follower.id === `https://social-distribution-95d43f28bb8f.herokuapp.com/authors/${userId}` ||
                        follower.id === `https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}`);
                    setIsFollowing(isUserFollowing);
                }
            } catch (error) {
                console.error("Error fetching data: ", error.response?.data || error.message);
            }
        };

        fetchUserId();
        fetchServerCredentials();
        fetchInitialData();
        fetchFollowers();
    }, [id, userId]);

    const fetchFollowers = async () => {
        try {
            const serverAuth = serverCredentials[author_info.host];
            const response = await axios.get(`${author_info.host}api/authors/${id}/followers?size=100`, {
                auth: {
                    username: serverAuth.outgoing_username,
                    password: serverAuth.outgoing_password
                }
            });
            setFollowers(response.data);
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
        const inboxUrl = `${author_info.host}api/authors/${id}/inbox`;
        const serverAuth = serverCredentials[author_info.host];
    
        if (isFollowing) {
            const actorResponse = await axios.get(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/`, config);
            const actor_info = actorResponse.data;
            console.log(actor_info)
            const unfollowData = {
                type: 'Unfollow',
                actor: actor_info,
                object: author_info
            };
            try {
                await axios.post(inboxUrl, unfollowData, {
                    auth: {
                        username: serverAuth.outgoing_username,
                        password: serverAuth.outgoing_password
                    }
                });
                setIsFollowing(false);
            } catch (error) {
                console.error("Error sending unfollow request: ", error.response?.data || error.message);
            }
        } else {
            const data = { "to_follow": author_info };
            try {
                await axios.post(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/sendfollowrequest/`, data, config);
                setIsFollowing(true); 
            } catch (error) {
                console.error("Error sending follow request: ", error.response?.data || error.message);
            }
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

    const handleChangePage = (event, value) => {
        setPostsPage(value);
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
                        textAlign: 'center'
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
                    <Button onClick={toggleFollow} variant="outlined" sx={buttonStyles}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    {loading ?
                        <Box sx={{ pt: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "12%" }}>
                            <img src="https://imgur.com/KX0kfY9.png" alt="Logo" style={{ height: '40px', marginRight: '0px' }} />
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                fontWeight: 'bold',
                                color: '#1976d2',
                                fontFamily: 'Lexend',
                                paddingBottom: '20px',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                                }}
                            >
                                SocialDistribution
                            </Typography>
                            <CircularProgress className='loading-screen'/> 
                        </Box>
                        :
                        <>
                        {posts.length > 0 ? (
                            <Grow in={!loading} timeout={1000}>
                                <Box sx={{ maxWidth: '1000px', width: '100%', margin: 'auto' }}>
                                    {posts.slice((postsPage - 1) * 5, (postsPage - 1) * 5 + 5).map(post => (
                                    <TimelinePost key={post.id} post={post} isViewOnly={true} />
                                    ))}
                                </Box>
                                </Grow>    
                        ) : (
                                    <Typography variant="subtitle1" style={{ textAlign: 'center' }}>No posts found!</Typography>
                                )}
                        {posts.length > 0 && (
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', marginBottom: 2}}>
                                <Pagination
                                    count={Math.ceil(posts.length / 5)}
                                    page={postsPage}
                                    onChange={handleChangePage}
                                    variant="outlined"
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                        </>
                        }
                </Box>
            </Container>
        </Box>
    );
}

export default UserProfileViewOnly;