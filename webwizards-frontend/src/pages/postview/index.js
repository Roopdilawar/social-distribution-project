import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TimelinePost } from '../../components/timeline-post';
import { Box } from '@mui/material';

const PostViewPage = () => {
    const [post, setPost] = useState(null); 
    const { postId } = useParams(); 
    const { authorId } = useParams(); 

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/authors/${authorId}/posts/${postId}`); 
                setPost(response.data); 
                console.log(response.data)
                console.log(response)
            } catch (error) {
                console.error("Error fetching post: ", error);
            }
        };

        fetchPost();
    }, [postId]); 

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
