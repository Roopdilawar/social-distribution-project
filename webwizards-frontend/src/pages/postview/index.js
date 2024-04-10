import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TimelinePost } from '../../components/timeline-post';
import { Box } from '@mui/material';

const PostViewPage = () => {
    const [post, setPost] = useState(null); 
    const { postId } = useParams(); 
    const { authorId } = useParams(); 
    const { host } = useParams();

    const [serverCredentials, setServerCredentials] = useState({});

    const fetchServerCredentials = async () => {
        const token = localStorage.getItem('token');
        if (!token) return console.log('No token found');
        
        try {
            const response = await axios.get('http://localhost:8000/api/server-credentials/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setServerCredentials(response.data);
        } catch (error) {
            console.error("Error fetching server credentials:", error);
        }
    };

    useEffect(() => {
        fetchServerCredentials();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            if (host === 'localhost:8000') {
                console.log(serverCredentials);
                console.log(`http://${host}/`)
                const serverAuth = serverCredentials[`http://${host}/`];

                console.log(serverAuth);
                try {
                    const response = await axios.get(`http://${host}/api/authors/${authorId}/posts/${postId}`, {
                        auth: {
                            username: serverAuth.outgoing_username,
                            password: serverAuth.outgoing_password
                        }
                    });
                    setPost(response.data); 
                    console.log(response.data)
                    console.log(response)
                } catch (error) {
                    console.error("Error fetching post: ", error);
                }
            }

            const serverAuth = serverCredentials[`https://${host}.herokuapp.com/`];
            try {
                const response = await axios.get(`https://${host}.herokuapp.com/api/authors/${authorId}/posts/${postId}`, {
                    auth: {
                        username: serverAuth.outgoing_username,
                        password: serverAuth.outgoing_password
                    }
                });
                setPost(response.data); 
                console.log(response.data)
                console.log(response)
            } catch (error) {
                console.error("Error fetching post: ", error);
            }
        };

        fetchPost();
    }, [postId, serverCredentials]); 

    return (
        <Box sx={{ pt: 9 }}>
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            {post && (
                <TimelinePost key={post.id} post={post} detailedView={true}/> 
            )}
        </div>
        </Box>
    );
};

export default PostViewPage;
