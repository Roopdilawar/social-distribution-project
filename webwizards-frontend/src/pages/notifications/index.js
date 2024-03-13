import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Grid, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';


const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.short,
    }),
    '&:hover': {
        transform: 'scale(1.2)',
        color: theme.palette.primary.main,
    },
}));

function NotificationsPage() {
    const notifications = {
        "type":"inbox",
        "author":"http://127.0.0.1:5454/authors/c1e3db8ccea4541a0f3d7e5c75feb3fb",
        "items":[
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "summary": "Lara Croft Likes your post",         
                    "type": "Like",
                    "author":{
                        "type":"author",
                        "id":"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
                        "host":"http://127.0.0.1:5454/",
                        "displayName":"Lara Croft",
                        "url":"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
                        "github":"http://github.com/laracroft",
                        "profileImage": "https://i.imgur.com/k7XVwpB.jpeg"
                    },
                    "object":"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
                },
            {
                "type": "Follow",      
                "summary":"Greg wants to follow Lara",
                "actor":{
                    "type":"author",
                    "id":"http://127.0.0.1:5454/authors/1d698d25ff008f7538453c120f581471",
                    "url":"http://127.0.0.1:5454/authors/1d698d25ff008f7538453c120f581471",
                    "host":"http://127.0.0.1:5454/",
                    "displayName":"Greg Johnson",
                    "github": "http://github.com/gjohnson",
                    "profileImage": "https://i.imgur.com/k7XVwpB.jpeg"
                },
                "object":{
                    "type":"author",
                    // ID of the Author
                    "id":"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
                    // the home host of the author
                    "host":"http://127.0.0.1:5454/",
                    // the display name of the author
                    "displayName":"Lara Croft",
                    // url to the authors profile
                    "url":"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
                    // HATEOS url for Github API
                    "github": "http://github.com/laracroft",
                    // Image from a public domain
                    "profileImage": "https://i.imgur.com/k7XVwpB.jpeg"
                }
            }
        ]
    };

    const nonPostNotifications = notifications.items.filter(notification => notification.type !== "post");

    if (nonPostNotifications.length === 0) {
        return <Typography sx={{ pt: 9, textAlign: 'center' }}>No notifications.</Typography>;
    }

    const handleAcceptFollow = (actorId) => {
        console.log(`Accepting follow request from ${actorId}`);
        // Implement logic here.
    };

    return (
        <Box sx={{ pt: 9 }}>
            <div style={{ maxWidth: '1000px', margin: 'auto' }}>
                {notifications.items.filter(notification => notification.type !== "post").map((notification, index) => (
                    <Card key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar alt={notification.author?.displayName || notification.actor?.displayName} src={notification.author?.profileImage || notification.actor?.profileImage} sx={{ marginRight: 2 }}/>
                            <Box>
                                <Typography variant="h6">
                                    {notification.author?.displayName || notification.actor?.displayName}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    {notification.summary}
                                </Typography>
                            </Box>
                        </CardContent>
                        {notification.type === "Follow" && (
                            <IconButton 
                                color="primary" 
                                onClick={() => handleAcceptFollow(notification.actor.id)}
                                sx={{ 
                                    margin: 'auto 16px auto 0',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': { 
                                        transform: 'scale(1.2)' 
                                    },
                                    '.MuiSvgIcon-root': { 
                                        fontSize: '2rem'
                                    }
                                }}
                            >
                                <CheckCircleIcon />
                            </IconButton>
                        )}
                    </Card>
                ))}
            </div>
        </Box>
    );
}

export default NotificationsPage;