import React, { useState, useEffect } from "react";
import "./styles.css";
import axios from "axios";
import { Card, CardHeader, Avatar, CardContent, Typography, IconButton, Tooltip, CardActions, Menu, MenuItem, Box, Snackbar, Collapse, Pagination, FormControl, InputLabel, OutlinedInput, Chip, Badge, InputAdornment } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Share from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export const TimelineRepost = ({ post, detailedView, handleCommentClick, isViewOnly, originalPost }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const [commentsCount, setCommentsCount] = useState(post.count || 0);
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState({});
    const [postAuthorId, setpostAuthorId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [comments, setComments] = useState([]);
    const [paginationNumber, setPaginationNumber] = useState(1);
    const [anotherPageAvailble, setAnotherPageAvailble] = useState(true);
    const [prevPageAvailble, setPrevPageAvailble] = useState(false);
    const [serverCredentials, setServerCredentials] = useState({});

    const navigate = useNavigate();

    const location = useLocation();
    const isProfilePage = location.pathname === "/profile";

    const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [expanded, setExpanded] = useState(false);
    const [newCommentVisible, setNewCommentVisible] = useState(false);
    const [newCommentInput, setNewCommentInput] = useState([]);

    useEffect(() => {
        const fetchServerCredentials = async () => {
            const token = localStorage.getItem('token');
            if (!token) return console.log('No token found');
            
            try {
                const response = await axios.get('https://social-distribution-95d43f28bb8f.herokuapp.com/api/server-credentials/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setServerCredentials(response.data);
            } catch (error) {
                console.error("Error fetching server credentials:", error);
            }
        };

        fetchServerCredentials();
    }, []);

    useEffect(() =>  {
        if (Object.keys(serverCredentials).length > 0) {
            fetchLikesAndComments();
        }
    }, [serverCredentials]);


    const fetchLikesAndComments = async () => {
        const endpointUrl = post.author.host;
        try {
            const serverAuth = serverCredentials[post.author.host];
            const response = await axios.get(`${endpointUrl}api/authors/${post.author.id.split('/').pop()}/posts/${post.id.split('/').pop()}`, {
                auth: {
                    username: serverAuth.outgoing_username,
                    password: serverAuth.outgoing_password
                }
            });
            setCommentsCount(response.data.count)
            const response_likes = await axios.get(`${endpointUrl}api/authors/${post.author.id.split('/').pop()}/posts/${post.id.split('/').pop()}/likes`, {
                auth: {
                    username: serverAuth.outgoing_username,
                    password: serverAuth.outgoing_password
                }
            });
            setLikesCount(response_likes.data.items.length)
            
        } catch (error) {
            console.error("Error fetching post information: ", error);
        }
    }

    useEffect(() => {
        const fetchUserId = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('https://social-distribution-95d43f28bb8f.herokuapp.com/api/get-user-id/', {
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
    }, [serverCredentials]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (userId == null) {
                return;
            }
            
            const token = localStorage.getItem('token');

            const config = {
                headers: {
                    'Authorization': `Token ${token}`
                }
            };
            try {
                const authorResponse = await axios.get(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/`, config);
                const authorData = authorResponse.data;
                setUserData(authorData);
            } catch (error) {
                console.error("Error fetching user info: ", error);
            }
        }

        fetchUserInfo();
    }, [userId])

    const handleUsernameClick = () => {
        const id = post.author.id.split('/').pop();
        const isCurrentUser = id.toString() === userId.toString();
        const baseUrl = post.id.replace("/api", "").split("/authors/")[0];
        const same_url = baseUrl === "https://social-distribution-95d43f28bb8f.herokuapp.com"
        const author_info = post.author;
        if (isCurrentUser && same_url) {
            navigate("/profile");
        } else {
            navigate(`/friend-profile/${id}`, { state: { author_info } });
        }
    };

    const handleOriginalUsernameClick = () => {
        const id = originalPost.author.id.split('/').pop();
        const isCurrentUser = id.toString() === userId.toString();
        const baseUrl = post.id.replace("/api", "").split("/authors/")[0];
        const same_url = baseUrl === "https://social-distribution-95d43f28bb8f.herokuapp.com"
        const author_info = originalPost.author;
        if (isCurrentUser && same_url) {
            navigate("/profile");
        } else {
            navigate(`/friend-profile/${id}`, { state: { author_info } });
        }
    }
    

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
        const endpointUrl = post.author.host;
        const postId = post.id.split('/').pop();
        const token = localStorage.getItem('token');
        try {
            const serverAuth = serverCredentials[post.author.host];

            if (serverAuth) {
                const response = await axios.get(`${endpointUrl}api/authors/${post.id.split('/authors/')[1].split('/')[0]}/posts/${postId}/comments?page=${paginationNumber}`, {
                    auth: {
                        username: serverAuth.outgoing_username,
                        password: serverAuth.outgoing_password
                    }
                });
                if (response.data.next != null) {
                    setAnotherPageAvailble(true);
                }
                else {
                    setAnotherPageAvailble(false);
                }
    
                if (response.data.prev != null) {
                    setPrevPageAvailble(true);
                }
    
                else {
                    setPrevPageAvailble(false);
                }
                const orderedComments = response.data.comments.sort((a,b) => new Date(b.created) - new Date(a.created));
                setComments(orderedComments);
            }
        } catch (error) {
            console.error("Errror fetching comments: ", error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [paginationNumber])

    const handleCommentSubmit = async (event) => {
        const endpointUrl = post.author.host;
        const postId = post.id.split('/').pop();
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            const authorResponse = await axios.get(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/`, config);
            const authorData = authorResponse.data;
            const commentData = {
                object: post,
                comment: newCommentInput,
                published: new Date().toISOString(),
                author: authorData
            };
            const serverAuth = serverCredentials["https://social-distribution-95d43f28bb8f.herokuapp.com/"];
           
            const response = await axios.post(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/addcomment`, commentData, {
                auth: {
                    username: serverAuth.outgoing_username,
                    password: serverAuth.outgoing_password
                }
            });
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
            await axios.delete(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${post.id.split('/authors/')[1].split('/')[0]}/posts/${postId}`, config);
            console.log("Post deleted successfully");
            handleMenuClose();
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };

    const handleLike = async () => {
    
        const token = localStorage.getItem('token');
        const postId = post.id.split('/').pop(); 
        const authorId = post.author.id.split('/').pop();
        const endpointUrl = post.id.replace("/api", "").split('/authors')[0];

    
        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };
    
        try {
            const authorResponse = await axios.get(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/`, config);
            const authorData = authorResponse.data;
            const likeData = {
                "actor": authorData,
                "object": post
            };
            await axios.post(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/liked`, { "object_id": post.id }, config);
            await axios.post(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/like/`, likeData, config);
            setIsLiked(true);
            setLikesCount(likesCount + 1); 
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };


    const renderContent = () => {
        switch (post.contentType) {
            case 'text/plain':
                return <Typography variant="body2">{originalPost.content}</Typography>;
            case 'text/markdown':
                return <ReactMarkdown>{originalPost.content}</ReactMarkdown>;
            case 'image/base64':
                return <img src={originalPost.content} alt="Post" style={{ maxWidth: '100%', marginTop: '20px' }} />;
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
            <Card sx={{ marginBottom: 1, '&:hover': { boxShadow: detailedView ? 0 : 6 } , width: '82%', mx: 'auto'}}>
                <CardHeader
                    avatar={<Avatar src={post.author.profileImage} alt={post.author.displayName} />}
                    title={
                        <Typography variant="subtitle2" color="primary" onClick={!isViewOnly ? handleUsernameClick : null} style={{ cursor: !isViewOnly ? 'pointer' : 'default' }}>
                            {post.author.displayName}
                        </Typography>}
                    subheader={<Typography variant="caption">{timeAgo(post.published)}</Typography>}
                    action={<Box display="flex" alignItems="center">
                        <Chip label="Repost" color="default" size="small" />
                        {!isViewOnly && isProfilePage && (
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
                    </Box> 
                    }
                />
                <CardContent>
                    <Card sx={{ marginBottom: 1, boxShadow: '0px 0px 5px rgba(0,0,0,0.5)', '&:hover': { boxShadow: detailedView ? 3 : 6 } }}>
                        <CardHeader
                            avatar={<Avatar src={originalPost.author.profileImage} alt={originalPost.author.displayName} />}
                            title={
                                <Typography variant="subtitle2" color="primary" onClick={!isViewOnly ? handleOriginalUsernameClick : null} style={{ cursor: !isViewOnly ? 'pointer' : 'default' }}>
                                    {originalPost.author.displayName}
                                </Typography>}
                            subheader={<Typography variant="caption">{timeAgo(originalPost.published)}</Typography>}
                        />
                        <CardContent>
                            <Typography variant="h6" color="textPrimary" gutterBottom>
                                {originalPost.title}
                            </Typography>
                            {renderContent()}
                        </CardContent>
                    </Card>
                </CardContent>
                <CardActions disableSpacing>
                    <Box display="flex" justifyContent="space-between" width="100%" px={1}>
                        <Box display="flex" justifyContent="space-around" width="100%">
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Tooltip title="Like">
                                    <Badge badgeContent={likesCount} color="primary">
                                        <IconButton aria-label="like" onClick={handleLike} color={isLiked ? "error" : "default"}>
                                            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                    </Badge>
                                </Tooltip>
                            </Box>
                            
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Tooltip title="Comment">
                                    <Badge badgeContent={commentsCount} color="primary">
                                        <IconButton aria-label="comment" onClick={handleExpandComments}>
                                            <ChatBubbleOutlineIcon />
                                        </IconButton>
                                    </Badge>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </CardActions>       
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    {newCommentVisible && (
                        <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
                            <Avatar src={userData.profileImage} alt={userData.displayName} sx={{ marginRight: 2 }} />
                            <Box sx={{ width: '100%' }}>
                                <FormControl fullWidth variant="outlined" size="small">
                                    <InputLabel htmlFor="new-comment">New Comment</InputLabel>
                                    <OutlinedInput
                                        id="new-comment"
                                        label="New Comment"
                                        multiline
                                        maxRows={4}
                                        value={newCommentInput}
                                        onChange={(event) => setNewCommentInput(event.target.value)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="submit comment"
                                                    onClick={handleCommentSubmit}
                                                    edge="end"
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Box>
                        </Box>
                    )}
                    <Box sx={{ padding: 2 }}>
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <Comment comment={comment} key={comment.id} post={post} />
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary" align="center">
                                No comments.
                            </Typography>
                        )}
                        <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                            {prevPageAvailble && (
                                <IconButton onClick={() => setPaginationNumber(paginationNumber - 1)}>
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                            )}
                            {anotherPageAvailble && (
                                <IconButton onClick={() => setPaginationNumber(paginationNumber + 1)}>
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
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
