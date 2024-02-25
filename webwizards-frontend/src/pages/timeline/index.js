import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, Avatar, CardMedia, CardContent, Typography, IconButton, Tooltip, CardActions} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Share from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PostDetailModal from "../../components/post-detail-modal";


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
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
};


export const Post = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLike = async () => {
        const token = localStorage.getItem('token');
        const postId = post.id.split('/').pop();
    
        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };
    
        try {
            const response = await axios.post(`http://localhost:8000/api/posts/${postId}/like/`, {}, config);
            console.log(response.data);
            setIsLiked(!isLiked); 
        } catch (error) {
            console.error("Error liking post: ", error);
        }
    };    

    const toggleModal = () => {
        console.log("Modal Clicked")
        setIsModalOpen(!isModalOpen);
    };

    const renderContent = () => {
        switch (post.content_type) {
            case 'text/plain':
                return <Typography variant="body2">{post.content}</Typography>;
            case 'text/markdown':
                return <ReactMarkdown>{post.content}</ReactMarkdown>;
            case 'image/base64':
                return <img src={post.content} alt="Post" style={{ maxWidth: '100%', marginTop: '20px' }} />;
            default:
                return <Typography variant="body2">Unsupported content type</Typography>;
        }
    };       

    return (
        <>
            <Card sx={{ marginBottom: 1, '&:hover': { boxShadow: 6 } }}>
                <CardHeader
                    avatar={<Avatar src={post.author.profileImage} alt={post.author.displayName} />}
                    title={<Typography variant="subtitle2" color="primary">{post.author.displayName}</Typography>}
                    subheader={<Typography variant="caption">{new Date(post.published).toLocaleString()}</Typography>}
                    action={<IconButton><MoreVertIcon /></IconButton>}
                />
                <CardContent>
                    <Typography variant="h6" color="textPrimary" gutterBottom>
                        {post.title}
                    </Typography>
                    {renderContent()}
                </CardContent>
                <CardActions disableSpacing>
                <Tooltip title="Like">
                    <IconButton aria-label="like" onClick={handleLike} color={isLiked ? "error" : "default"}>
                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Comment">
                    <IconButton aria-label="comment" onClick={toggleModal}>
                        <ChatBubbleOutlineIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                    <IconButton aria-label="share">
                        <Share />
                    </IconButton>
                </Tooltip>
            </CardActions>
            </Card>
            <PostDetailModal isModalOpen={isModalOpen} onClose={toggleModal} post={post} />
        </>
    );
};

export default TimelinePage;




