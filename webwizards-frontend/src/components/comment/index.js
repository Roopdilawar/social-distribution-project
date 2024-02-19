import { Typography } from "@mui/material"
import "./styles.css"

export default function Comment (props) {
    return(
        <div className="comment-container">
            <div className="comment-header">
                <img src="" alt="profile" className="comment-profile-pic" />
                <div className="post-info">
                    <span className="comment-username">{props.displayName}</span>
                    <span className="comment-description">
                        {props.description}
                    </span>
                </div>
            </div>
        </div>
    )
}