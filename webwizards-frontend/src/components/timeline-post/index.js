import React, { useState } from "react";
import "./styles.css";
import axios from "axios";
import { Card, CardHeader, Avatar, CardContent, Typography, IconButton, Tooltip, CardActions, Menu, MenuItem, Box,  } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Share from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PostDetailModal from "../post-detail-modal";
import { useLocation } from "react-router-dom"; 
import ReactMarkdown from 'react-markdown';
import EditPost from '../edit-post-modal/index.js';

export const TimelinePost = ({ post, detailedView, handleCommentClick }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 

    const location = useLocation();
    const isProfilePage = location.pathname === "/profile";

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true); 
        handleMenuClose();
    };

    const handleDelete = async () => {
        const postId = post.id.split('/').pop();
    
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };
    
        try {
            await axios.delete(`http://localhost:8000/api/posts/${postId}/`, config);
            console.log("Post deleted successfully");
            handleMenuClose();
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem('token');
        const postId = post.id.split('/').pop();

        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            await axios.post(`http://localhost:8000/api/posts/${postId}/like/`, {}, config);
            setIsLiked(true);
        } catch (error) {
            console.error("Error liking post: ", error);
        }
    };

    const toggleModal = () => {
        if (detailedView) {
            handleCommentClick();
        } else {
            setIsModalOpen(!isModalOpen);
        }
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
            <Card sx={{ marginBottom: 1, '&:hover': { boxShadow: detailedView ? 0 : 6 } }}>
                <CardHeader
                    avatar={<Avatar src={post.author.profileImage} alt={post.author.displayName} />}
                    title={<Typography variant="subtitle2" color="primary">{post.author.displayName}</Typography>}
                    subheader={<Typography variant="caption">{new Date(post.published).toLocaleString()}</Typography>}
                    action={
                        isProfilePage && (
                            <>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleEdit}>Edit</MenuItem>
                                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                                </Menu>
                            </>
                        )
                    }
                />
                <CardContent>
                    <Typography variant="h6" color="textPrimary" gutterBottom>
                        {post.title}
                    </Typography>
                    {renderContent()}
                </CardContent>
                <CardActions disableSpacing>
                    <Box display="flex" alignItems="flex-start">
                        <Box display="flex" flexDirection="column" alignItems="center" marginRight={2}>
                            <Tooltip title="Like">
                                <IconButton aria-label="like" onClick={handleLike} color={isLiked ? "error" : "default"}>
                                    {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </IconButton>
                            </Tooltip>
                            <Typography variant="caption" style={{ userSelect: 'none', fontSize: '0.75rem' }}>
                                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                            </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="center" marginRight={2}>
                            <Tooltip title="Comment">
                                <IconButton aria-label="comment" onClick={toggleModal}>
                                    <ChatBubbleOutlineIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="caption" style={{ userSelect: 'none', fontSize: '0.75rem' }}>
                                {post.Comment_counts} {post.Comment_counts === 1 ? 'Comment' : 'Comments'}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Tooltip title="Share">
                                <IconButton aria-label="share">
                                    <Share />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardActions>
            </Card>
            <PostDetailModal isModalOpen={isModalOpen} onClose={toggleModal} post={post} />
            <EditPost
                isOpen={isEditModalOpen}
                handleClose={() => setIsEditModalOpen(false)}
                post={post} 
            />
        </>
    );
};
