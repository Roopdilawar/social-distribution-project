import React from "react";
import { Modal, Typography, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import Comment from "../comment";

export default function PostDetailModal (props) {
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
    ]
    return(
        <div className="post-detail-modal">
            <Modal 
                open={props.isModalOpen}
                onClose={props.onClose}
            >
                <Box className="modal-container">
                    <div className="post-header">
                        <img src="" alt="profile" className="profile-pic" />
                        <div className="post-info">
                            <span className="username">{props.displayName}</span>
                            <span className="timestamp">2h ago</span>displayName
                        </div>
                    </div>
                    <div className="post-content">
                        <p>{props.description}</p>
                    </div>
                    <div className="like-and-comment-count">
                        <span className="likes-count">
                            <Typography>
                                1000 Likes
                            </Typography>
                        </span>
                        <span className="comments-count">
                            <Typography>
                                1000 comments
                            </Typography>
                        </span>
                    </div>
                    <div className="post-actions">
                        <span className="like">
                            <FontAwesomeIcon icon={faHeart} />
                        </span> 
                        <span className="comment">
                            <FontAwesomeIcon icon={faComment} />
                        </span>
                    </div>
                    <div className="all-comments-container">
                        {fakeCommentsArray.map((comment) => (
                            <Comment
                                displayName={comment.author.displayName}
                                description={comment.description}
                                key={comment.id}
                            />
                        ))}
                    </div>
                </Box>
            </Modal>
        </div>
    )
}