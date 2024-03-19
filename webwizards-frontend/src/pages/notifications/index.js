import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Avatar, IconButton } from '@mui/material';
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
  const [notifications, setNotifications] = useState({ items: [] });
  const [userId, setUserId] = useState(null);
  const [nonPostNotifications, setNonPostNotifications] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/api/get-user-id/', {
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

  useEffect(() => {
    if (!userId) return; 

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/authors/${userId}/inbox/`);
        const data = response.data;
        setNotifications(data);
        const filteredNotifications = data.items.filter(notification => notification.type !== "post");
        setNonPostNotifications(filteredNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [userId]); 

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