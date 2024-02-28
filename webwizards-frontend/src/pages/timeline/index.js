import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TimelinePost } from '../../components/timeline-post';


const TimelinePage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/posts/');
                const orderedPosts = response.data.items.sort((a, b) => new Date(b.published) - new Date(a.published));
                setPosts(orderedPosts);
            } catch (error) {
                console.error("Error fetching posts: ", error);
            }
        };

        fetchPosts();
    }, []);

    console.log(posts)

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            {posts.map(post => (
                <TimelinePost key={post.id} post={post} detailedView={false}/>
            ))}
        </div>
    );
};

export default TimelinePage;




