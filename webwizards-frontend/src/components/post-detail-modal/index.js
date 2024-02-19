import {React, useState} from "react";
import { Modal, Typography, Box, Pagination } from '@mui/material';
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

    // const handlePageChange = (event, page) => {
    //     setCommentsPage(page);
    // }

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
                                {fakeCommentsArray.length} comments
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
                        {fakeCommentsArray.slice(commentsPage * 10, ((commentsPage * 10) + 10)).map((comment) => (
                            <Comment
                                displayName={comment.author.displayName}
                                description={comment.description}
                                key={comment.id}
                            />
                        ))}
                        <Pagination
                            count={(Math.floor(fakeCommentsArray.length / 10)) + 1}
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