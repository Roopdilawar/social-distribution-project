import React from "react";
import { Modal, Typography, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

export default function PostDetailModal (props) {

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };

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
                </Box>
            </Modal>
        </div>
    )
}