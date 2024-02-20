import React from "react"
import PropTypes from "prop-types"
import "./styles.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';
import PostDetailModal from "../post-detail-modal";
import { useState, useEffect } from "react";

export default function TimelinePost (props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="post-overall">
            <div className="post-header" onClick={() => setIsModalOpen(!isModalOpen) }>
                <img src="" alt="profile" className="profile-pic" />
                <div className="post-info">
                    <span className="username">{props.displayName}</span>
                    <span className="timestamp">2h ago</span>displayName
                </div>
            </div>
            <div className="post-content">
                    <p>{props.description}</p>
            </div>
            <div className="post-actions">
                <span className="like">
                    <FontAwesomeIcon icon={faHeart} />
                </span> 
                <span className="comment">
                    <FontAwesomeIcon icon={faComment} />
                </span>
            </div>
            <PostDetailModal 
                isModalOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    console.log("UGH")
                }}
                displayName={props.displayName}
                description={props.description}
            />
        </div>
    )
}