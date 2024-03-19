import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Switch } from '@mui/material';
import { TimelinePost } from '../../components/timeline-post';

const TimelinePage = () => {
    const [posts, setPosts] = useState([]);
    const [isFollowingView, setIsFollowingView] = useState(false);
    const [userId, setUserId] = useState(null);

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
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchPosts = async () => {
            let endpoint = 'http://localhost:8000/api/posts/';
            if (isFollowingView) {
                endpoint = `http://localhost:8000/api/authors/${userId}/inbox/`;
            }

            try {
                const response = await axios.get(endpoint);
                if (isFollowingView) {
                    const filteredPosts = response.data.content.filter(item => item.type === 'post');
                    const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    setPosts(orderedPosts);
                }
                else {
                    const filteredPosts = response.data
                    const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    setPosts(orderedPosts);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
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
        </Box>
    );
};

export default TimelinePage;
