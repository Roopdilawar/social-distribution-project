import React from "react"
import PropTypes from "prop-types"
import "./styles.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';


export default class TimelinePost extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        description: PropTypes.string,
        displayName: PropTypes.string,
    }

    render() {
        return (
            <div className="post-overall">
                <div className="post-header">
                    <img src="" alt="profile" className="profile-pic" />
                    <div className="post-info">
                        <span className="username">{this.props.author.displayName}</span>
                        <span className="timestamp">2h ago</span>displayName
                    </div>
                </div>
                <div className="post-content">
                        <p>{this.props.description}</p>
                </div>
                <div className="post-actions">
                    <span className="like">
                        <FontAwesomeIcon icon={faHeart} />
                    </span> 
                    <span className="comment">
                        <FontAwesomeIcon icon={faComment} />
                    </span>
                </div>
            </div>
        )
    }
}