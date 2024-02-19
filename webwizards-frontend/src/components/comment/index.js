import { Typography } from "@mui/material"
import "./styles.css"

export default function Comment (props) {
    return(
        <div className="comment-container">
            <div className="comment-header">
                <img src="" alt="profile" className="profile-pic" />
                <div className="post-info">
                    <span className="username">{props.displayName}</span>
                    <span>
                        <Typography>
                            {props.description}
                        </Typography>
                    </span>
                </div>
            </div>
        </div>
    )
}