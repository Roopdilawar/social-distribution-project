import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TimelinePost } from '../../components/timeline-post';

const PostViewPage = () => {
    const [post, setPost] = useState(null); 
    const { postId } = useParams(); 

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/posts/${postId}/`); 
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
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            {post && (
                <TimelinePost key={post.id} post={post} detailedView={true}/> 
            )}
        </div>
    );
};

export default PostViewPage;
