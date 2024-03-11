import { Avatar, Card, CardHeader, CardContent, Typography } from "@mui/material"
import "./styles.css"

// export default function Comment ({comment}) {
//     return(
//         <div className="comment-container">
//             <div className="comment-header">
//                 <Avatar src={comment.author.profileImage} alt={comment.author.displayName} className="comment-avatar"/>
//                 <div className="post-info">
//                     <div className="username-publish">
//                         <span className="comment-username">{comment.author.displayName}</span>
//                         <span className="comment-time">{new Date(comment.created).toLocaleString()}</span>
//                     </div>
//                     <span className="comment-description">
//                         {comment.content}
//                     </span>
//                 </div>
//             </div>
//         </div>
//     )
// }

export default function Comment ({ comment }) {
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
            </Card>
        </div>
    )
}