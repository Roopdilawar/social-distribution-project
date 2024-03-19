import React, { useState } from "react";
import { Avatar, Card, Box, IconButton, Tooltip, CardActions, CardHeader, CardContent, Typography } from "@mui/material"
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from "axios";
import "./styles.css"

export default function Comment ({ comment, post }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likes || 0);
    
    const handleLike = async () => {
        const token = localStorage.getItem('token');
        const postId = post.id.split('/').pop();
        const commentId = comment.id;


        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            await axios.post(`http://localhost:8000/api/posts/${postId}/comments/${commentId}/like/`, {}, config);
            setIsLiked(true);
        } catch (error) {
            console.error("Error liking post: ", error);
        }
    };

    return(
        <div className="card-container">
            <Card className="comment-card" variant="outlined">
                <CardHeader
                    avatar={<Avatar src={comment.author.profileImage} alt={comment.author.displayName} />}
                    title={<Typography variant="subtitle2" color="primary">{comment.author.displayName}</Typography>}
                    subheader={<Typography variant="caption">{new Date(comment.created).toLocaleString()}</Typography>}                    
                />
                <CardContent class-name="comment-content">
                    <Typography variant="body2">
                        {comment.content}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing>
                        <Box display="flex" alignItems="flex-start">
                            <Box display="flex" flexDirection="column" alignItems="center" marginRight={2}>
                                <Tooltip title="Like">
                                    <IconButton aria-label="like" color={isLiked ? "error" : "default"} onClick={handleLike}>
                                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="caption" style={{ userSelect: 'none', fontSize: '0.75rem' }}>
                                    {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardActions>
            </Card>
        </div>
    )
}