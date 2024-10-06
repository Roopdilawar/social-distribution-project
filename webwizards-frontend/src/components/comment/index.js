import React, { useState, useEffect } from "react";
import { Avatar, Card, Box, CardHeader, CardContent, Typography, Chip } from "@mui/material";
import axios from "axios";
import { formatDistanceToNow, parseISO } from 'date-fns';
import "./styles.css";

const getHostTag = (host) => {
    let tag = { text: 'Local', color: 'dark-grey' };
    if (host.includes('deadly-bird')) {
        tag = { text: 'Deadly-Bird', color: 'red' };
    } else if (host.includes('y-com')) {
        tag = { text: 'Y.com', color: 'blue' };
    } else if (host.includes('espresso')) {
        tag = { text: 'Espresso', color: 'brown' };
    }
    return tag;
};

export default function Comment({ comment, post }) {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                return;
            }
            try {
                const response = await axios.get('https://social-distribution-95d43f28bb8f.herokuapp.com/api/get-user-id/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                setUserId(response.data.user_id);
            } catch (error) {
                console.error("Error fetching user ID: ", error);
            }
        };

        fetchUserId();
    }, []);

    const hostTag = getHostTag(comment.author.host);

    return (
        <div>
            <Card variant="outlined" style={{ padding: '8px', marginBottom: '0px' }}>
                <CardHeader
                    avatar={<Avatar src={comment.author.profileImage} alt={comment.author.displayName} />}
                    title={
                        <Box display="flex" alignItems="center">
                            <Typography variant="subtitle2" color="primary" component="span">
                                {comment.author.displayName}
                            </Typography>
                            <Chip label={hostTag.text} size="small" style={{ marginLeft: '8px', backgroundColor: hostTag.color, color: 'white' }} />
                        </Box>
                    }
                    subheader={<Typography variant="caption">
                        {formatDistanceToNow(parseISO(comment.published), { addSuffix: true })}
                    </Typography>}
                />
                <CardContent>
                    <Typography variant="body2">
                        {comment.comment}
                    </Typography>
                </CardContent>
            </Card>
        </div>
    );
}
