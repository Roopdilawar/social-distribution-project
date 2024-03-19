import React, { useState, useEffect } from "react";
import "./styles.css";
import axios from "axios";
import { Card, CardHeader, Avatar, CardContent, Typography, IconButton, Tooltip, CardActions, Menu, MenuItem, Box, Snackbar, Collapse, Pagination, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Share from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useLocation } from "react-router-dom"; 
import ReactMarkdown from 'react-markdown';
import EditPost from '../edit-post-modal/index.js';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from "../../pages/profile/index.js"
import { UserProfileViewOnly } from "../../pages/friend-profile/index.js"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Comment from "../comment/index.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';


export const TimelinePost = ({ post, detailedView, handleCommentClick, isViewOnly }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const [userId, setUserId] = useState(null);
    const [postAuthorId, setpostAuthorId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [comments, setComments] = useState([]);
    const [commentsPage, setCommentsPage] = useState(0);

    const navigate = useNavigate();

    const location = useLocation();
    const isProfilePage = location.pathname === "/profile";

    const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [expanded, setExpanded] = useState(false);
    const [newCommentVisible, setNewCommentVisible] = useState(false);
    const [newCommentInput, setNewCommentInput] = useState([]);

    <Routes>
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/friend-profile/:id" element={<UserProfileViewOnly />} />
    {/* other routes */}
    </Routes>

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
            console.error("Error fetching user ID: ", error);
        }
        };

        fetchUserId();
    }, []);

    const handleUsernameClick = () => {
        console.log(userId)

        const id = post.author.id.split('/').pop();
        console.log(id)
        const isCurrentUser = id.toString() === userId.toString(); // Convert both to strings for comparison
         // Replace `currentUser.id` with the appropriate way to access the current user's ID
        if (isCurrentUser) {
            navigate("/profile");
        } else {
            navigate(`/friend-profile/${id}/`);
        }
    };
    

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        if (isViewOnly) return;
        setIsEditModalOpen(true); 
        handleMenuClose();
    };

    const handleExpandComments = () => {
        setExpanded(!expanded);
        setNewCommentVisible(true);
        fetchComments();
    }

    const fetchComments = async () => {
        const postId = post.id.split('/').pop();
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            const response = await axios.get(`http://localhost:8000/api/posts/${postId}/comments/`, config);
            const orderedComments = response.data.items.sort((a,b) => new Date(b.created) - new Date(a.created));
            setComments(orderedComments);
        } catch (error) {
            console.error("Errror fetching comments: ", error);
        }
    };

    const handleCommentSubmit = async (event) => {
        const postId = post.id.split('/').pop();
        const token = localStorage.getItem('token');

        const commentData = {
            post: postId,
            content: newCommentInput,
            created: new Date().toISOString(),
            author: ""
        };

        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            const response = await axios.post(`http://localhost:8000/api/posts/${postId}/addcomment/`, commentData, config);
            fetchComments();
            setNewCommentInput("");
        } catch (error) {
            console.error("Error submitting post: ", error);
        }
    }

    const handleDelete = async () => {
        if (isViewOnly) return;
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
        if (isViewOnly) return;
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

    const handleShareClick = async () => {
        if (post.visibility === 'PUBLIC') {
            const postLink = `${window.location.origin}/posts/${post.id.split('/').pop()}`;
            try {
                await navigator.clipboard.writeText(postLink);
                setSnackbarMessage("Link copied to clipboard"); 
                setShowCopyConfirmation(true); 
            } catch (error) {
                console.error("Failed to copy link: ", error);
            }
        } else {
            setSnackbarMessage("Sharing is not allowed for this post");
            setShowCopyConfirmation(true); 
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

    const timeAgo = (dateString) => {
        const date = parseISO(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <>
            <Card sx={{ marginBottom: 1, '&:hover': { boxShadow: detailedView ? 0 : 6 } }}>
                <CardHeader
                    avatar={<Avatar src={post.author.profileImage} alt={post.author.displayName} />}
                    title={
                        <Typography variant="subtitle2" color="primary" onClick={!isViewOnly ? handleUsernameClick : null} style={{ cursor: !isViewOnly ? 'pointer' : 'default' }}>
                            {post.author.displayName}
                        </Typography>}
                    subheader={<Typography variant="caption">{timeAgo(post.published)}</Typography>}
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
                    subheader={<Typography variant="caption">{new Date(post.published).toLocaleString()}</Typography>}
                    action={!isViewOnly && isProfilePage && (
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
                    )}
                />
                <CardContent>
                    <Typography variant="h6" color="textPrimary" gutterBottom>
                        {post.title}
                    </Typography>
                    {renderContent()}
                </CardContent>
                {!isViewOnly && (
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
                                    <IconButton aria-label="comment" onClick={handleExpandComments}>
                                        <ChatBubbleOutlineIcon />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="caption" style={{ userSelect: 'none', fontSize: '0.75rem' }}>
                                    {post.commentCounts} {post.commentCounts === 1 ? 'Comment' : 'Comments'}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                                <Tooltip title="Share">
                                    <IconButton aria-label="share" onClick={handleShareClick}>
                                        <Share />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </CardActions>
                )}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    {newCommentVisible && (
                        <div className="new-comment-container">
                            <Avatar src={post.author.profileImage} alt={post.author.displayName} className="new-comment-avatar" />
                            <div className="comment-info">
                                <span className="comment-input">
                                    <FormControl fullWidth>
                                        <InputLabel>New Comment</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-amount"
                                            label="New Comment"
                                            onChange={(event) => setNewCommentInput(event.target.value)}
                                            value={newCommentInput}
                                        />
                                    </FormControl>
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faPaperPlane} className="submit-button" size="lg" onClick={handleCommentSubmit} />
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="all-comments-container">
                        {comments.length > 0 ? comments.slice(commentsPage * 10, (commentsPage * 10) + 10).map((comment) => (
                            <Comment comment={comment} key={comment.id} />
                        )) : <Typography>No comments.</Typography>}
                        <Pagination count={Math.ceil(comments.length / 10)} page={commentsPage + 1} onChange={(event, page) => setCommentsPage(page - 1)} />
                    </div>
                </Collapse>
            </Card>
            {!isViewOnly && (
                <EditPost
                    isOpen={isEditModalOpen}
                    handleClose={() => setIsEditModalOpen(false)}
                    post={post}
                />
            )}
            <Snackbar
                open={showCopyConfirmation}
                autoHideDuration={2000}
                onClose={() => setShowCopyConfirmation(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );    
};
