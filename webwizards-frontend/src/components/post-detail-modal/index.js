import {React, useEffect, useState} from "react";
import axios from 'axios';
import { Modal, Typography, Box, Pagination, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment, Avatar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import Comment from "../comment";
import { TimelinePost } from "../timeline-post";

export default function PostDetailModal (props) {
    const token = localStorage.getItem('token');
    const [comments, setComments] = useState([]);
    const [newCommentInput, setNewCommentInput] = useState([]);
    const parsedPost = props.post.id.split("/");
    const postId = parsedPost[parsedPost.length - 1]

    const fetchComments = async () => {
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

    useEffect(() => {
        fetchComments();
    }, []);

    const fakeCommentsArray = [
        {
            author: {
                displayName: "First commenter"
            },
            description: "Wow what an incredible post!",
            id: '1'
        },
        {
            author: {
                displayName: "Second commenter"
            },
            description: "Wow what an incredible post!",
            id: '2'
        },
        {
            author: {
                displayName: "Third commenter"
            },
            description: "Wow what an incredible post!",
            id: '3'
        },
        {
            author: {
                displayName: "Fourth commenter"
            },
            description: "Wow what an incredible post!",
            id: '4'
        },
        {
            author: {
                displayName: "Fifth commenter"
            },
            description: "Wow what an incredible post!",
            id: '5'
        },
        {
            author: {
                displayName: "Sixth commenter"
            },
            description: "Wow what an incredible post!",
            id: '6'
        },
        {
            author: {
                displayName: "Seventh commenter"
            },
            description: "Wow what an incredible post!",
            id: '7'
        },
        {
            author: {
                displayName: "Eight commenter"
            },
            description: "Wow what an incredible post!",
            id: '8'
        },
        {
            author: {
                displayName: "Ninth commenter"
            },
            description: "Wow what an incredible post!",
            id: '9'
        },
        {
            author: {
                displayName: "Tenth commenter"
            },
            description: "Wow what an incredible post!",
            id: '10'
        },
        {
            author: {
                displayName: "Eleventh commenter"
            },
            description: "Wow what an incredible post!",
            id: '11'
        },
    ]

    const [commentsPage, setCommentsPage] = useState(0);
    const [newCommentVisible, setNewCommentVisible] = useState(false);

    const handleCommentSubmit = async (event) => {
        console.log(token);
        console.log(newCommentInput);
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
            console.log(response.data);
            setNewCommentVisible(false);
            fetchComments();
        } catch (error) {
            console.error("Error submitting post: ", error);
        }
    }

    return(
        <div className="post-detail-modal">
            <Modal 
                open={props.isModalOpen}
                onClose={props.onClose}
            >
                <Box className="modal-container">
                    {/* <div className="post-header">
                    <Avatar src={props.post.author.profileImage} alt={props.post.author.displayName}/>
                    <div className="post-info">
                        <span className="username">{props.post.author.displayName}</span>
                        <span className="timestamp">2h ago</span>
                    </div>
                    </div>
                    <div className="modal-post-content">
                        <p>{props.post.description}</p>
                    </div>
                    <div className="like-and-comment-count">
                        <span className="likes-count">
                            <Typography>
                                1000 Likes
                            </Typography>
                        </span>
                        <span className="comments-count">
                            <Typography>
                                {comments.length} comments
                            </Typography>
                        </span>
                    </div>
                    <div className="post-actions">
                        <span className="like">
                            <FontAwesomeIcon icon={faHeart} />
                        </span> 
                        <span className="comment">
                            <FontAwesomeIcon icon={faComment} onClick={() => setNewCommentVisible(true)}/>
                        </span>
                    </div> */}
                    <TimelinePost post={props.post} detailedView={true} handleCommentClick={() => setNewCommentVisible(!newCommentVisible)}/>
                    {newCommentVisible ?
                    <div className="new-comment-container">
                        <Avatar src={props.post.author.profileImage} alt={props.post.author.displayName} />
                        <div className="comment-info">
                            <span className="comment-input">
                                <FormControl fullWidth>
                                    <InputLabel>New Comment</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-amount"
                                        label="New Comment"
                                        onChange={(event) => setNewCommentInput(event.target.value)}
                                    />
                                </FormControl>
                            </span>
                            <span>
                                <FontAwesomeIcon icon={faPaperPlane} className="submit-button" size="lg" onClick={handleCommentSubmit}/>
                            </span>
                        </div>
                    </div>
                    : ""
                    }
                    <div className="all-comments-container">
                        {comments.length >= 1 ? comments.slice(commentsPage * 10, ((commentsPage * 10) + 10)).map((comment) => (
                            <Comment
                                comment={comment}
                                key={comment.id}
                            />
                        )):
                        <Typography>
                            No comments.
                        </Typography>}
                        <Pagination
                            count={(Math.floor(comments.length / 10)) + 1}
                            onChange={(event, page) => {
                                console.log(page)
                                setCommentsPage(page - 1);
                                console.log(commentsPage * 10);
                            }}
                        />
                    </div>
                </Box>
            </Modal>
        </div>
    )
}