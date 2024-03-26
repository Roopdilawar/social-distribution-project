import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Switch, Pagination } from '@mui/material';
import { TimelinePost } from '../../components/timeline-post';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const TimelinePage = () => {
    const [posts, setPosts] = useState([]);
    const [isFollowingView, setIsFollowingView] = useState(false);
    const [userId, setUserId] = useState(null);
    const [serverCredentials, setServerCredentials] = useState([]);
    const [paginationNumber, setPaginationNumber] = useState(1);
    

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
        fetchPosts();
    }, [paginationNumber])

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
                console.error("Error fetching user ID:", error);
            }
        };
        
        fetchUserId();
        fetchServerCredentials();
    }, []);

    const fetchPosts = async () => {
        let tempPosts = [];

        if (isFollowingView) {
            try {
                const response = await axios.get(`http://localhost:8000/api/authors/${userId}/inbox/`, {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                });
                const filteredPosts = response.data.items.filter(item => item.type === 'post');
                const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                tempPosts = orderedPosts;
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        }

        else {
            for (let [url, credentials] of Object.entries(serverCredentials)) {
                let tempEndpoint = url + `/api/posts/?page=${paginationNumber}`;
              
                try {
                    const response = await axios.get(tempEndpoint, {
                        auth: {
                            username: credentials.outgoing_username,
                            password: credentials.outgoing_password
                        }
                    });
                    const filteredPosts = response.data.items
                    const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    for (let sortedPost of orderedPosts) {
                        tempPosts.push(sortedPost)
                    }
                } catch (error) {
                    console.error(`Error fetching posts from ${url}:`, error);
                }
            }
        }

        setPosts(tempPosts.sort((a, b) => new Date(b.published) - new Date(a.published)));
    };

    useEffect(() => {
        if (!userId) return;
        fetchServerCredentials();

        fetchPosts();
    }, [isFollowingView, userId]);

    return (
        <Box sx={{ pt: 9 }}>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginRight: 2 }}>
                    Explore
                </Typography>
                <Switch
                    checked={isFollowingView}
                    onChange={(event) => setIsFollowingView(event.target.checked)}
                />
                <Typography variant="body1" sx={{ marginLeft: 2 }}>
                    Following
                </Typography>
            </div>
            <div style={{ maxWidth: '1000px', margin: 'auto' }}>
                {posts.map(post => (
                    <TimelinePost key={post.id} post={post} detailedView={false} />
                ))}
            </div>
            <Box display="flex" justifyContent="center" alignItems="center">
                { paginationNumber > 1 ? <ArrowBackIosNewIcon onClick={() => setPaginationNumber(paginationNumber - 1)}/> : ""}
                <ArrowForwardIosIcon onClick={() => setPaginationNumber(paginationNumber + 1)}/>
            </Box>
        </Box>
    );
};

export default TimelinePage;
