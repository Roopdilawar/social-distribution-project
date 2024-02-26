import { Avatar } from "@mui/material"
import "./styles.css"

export default function Comment ({comment}) {
    return(
        <div className="comment-container">
            <div className="comment-header">
                <Avatar src={comment.author.profileImage} alt={comment.author.displayName} className="comment-avatar"/>
                <div className="post-info">
                    <div className="username-publish">
                        <span className="comment-username">{comment.author.displayName}</span>
                        <span className="comment-time">{new Date(comment.created).toLocaleString()}</span>
                    </div>
                    <span className="comment-description">
                        {comment.content}
                    </span>
                </div>
            </div>
        </div>
    )
}