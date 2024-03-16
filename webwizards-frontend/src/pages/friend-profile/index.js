import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../components/theme-context';
import { TimelinePost } from '../../components/timeline-post/index.js';

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

export function UserProfileViewOnly() {
    let { id } = useParams();
    
    const [currentBio, setCurrentBio] = useState('');
    const [currentProfilePic, setCurrentProfilePic] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [posts, setPosts] = useState([]);
    const { themeMode, toggleTheme } = useTheme();

    const [isFollowing, setIsFollowing] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const toggleFollow = () => {
        // Here you might also send a request to the server to follow/unfollow
        setIsFollowing(!isFollowing);
    };

    const handleFollowingOpen = () => setShowFollowing(true);
    const handleFollowingClose = () => setShowFollowing(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                return;
            }
            try {
                const headers = { 'Authorization': `Token ${token}` };
                
                // Fetch the author's details first
                const authorDetailsResponse = await axios.get(`http://localhost:8000/api/authors/${id}/`, { headers });

                // Use authorDetails for direct details and fetch additional data if needed
                //setCurrentBio(await fetchBio(headers)); // Assuming fetchBio is a function that returns bio
                setCurrentProfilePic(authorDetailsResponse.data.profileImage); // Assuming fetchProfilePic returns profile picture URL
                setDisplayName(authorDetailsResponse.data.displayName); // Adjust based on actual response
            
            } catch (error) {
                console.error("Error fetching data: ", error.response?.data || error.message);
            }
        };

        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/posts/');
                
                const allPosts = response.data.items;
    
                const userPosts = allPosts.filter(post => {
                    const authorId = post.author.id.split('/').pop();
                    const userIdString = id ? id.toString() : ''; 
                    
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
        fetchData();
    }, [id]);

    // Example fetch functions, replace with actual implementations
    // const fetchBio = async (headers) => {
    //     const response = await axios.get(`http://localhost:8000/api/user-bio/${id}/`, { headers });
    //     return response.data.bio;
    // };
 
    
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
                    <Avatar src={currentProfilePic} sx={{ width: 200, height: 200, borderRadius: '50%' }}/>
                    <Typography component="h1" variant="h5" sx={{
                        fontSize: '2.25em',
                        marginTop: 1,
                        fontFamily:'Roboto',
                        fontWeight: '1000',
                    }}>
                        {displayName}
                    </Typography>
                    <div style={{ marginTop: '20px' }} />
                    <Typography variant="body1" sx={{
                        fontSize: '1em',
                        fontFamily: 'Roboto', 
                    }}>
                        {currentBio}
                    
                {/* Follow button */}
                <Button
                    onClick={toggleFollow}
                    variant="contained"
                    sx={{
                        ml: 2,
                        //backgroundColor: isFollowing ? 'dark' : 'dark',
                        '&:hover': {
                            backgroundColor: isFollowing ? 'dark' : 'dark',
                        },
                    }}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </Button>    
                    </Typography>

                    <div style={{ marginTop: '40px' }} />

                    <Grid container spacing={4} justifyContent="center">
                        {/* Following and Followers buttons removed for brevity */}
                    </Grid>

                    <div style={{ marginTop: '40px' }} />
                    <div style={{ maxWidth: '1000px', width: '100%', margin: 'auto' }}>
                        {posts && posts.length > 0 ? (
                            posts.map(post => (
                                <TimelinePost key={post.id} post={post} isViewOnly={true} />
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
}

export default UserProfileViewOnly;
