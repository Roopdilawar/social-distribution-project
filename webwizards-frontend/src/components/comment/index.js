import { Avatar, Card, CardHeader, CardContent, Typography } from "@mui/material"
import "./styles.css"

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