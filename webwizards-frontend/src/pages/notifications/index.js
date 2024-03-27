import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Avatar, IconButton, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

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
  const [paginationNumber, setPaginationNumber] = useState(1);
  const [anotherPage, setAnotherPage] = useState(true);
  const [backPage, setBackPage] = useState(false);

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

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/authors/${userId}/inbox?page=${paginationNumber}`);
      const data = response.data.items.reverse();
      const filteredNotifications = data.filter(notification => notification.type !== "post");
      console.log(response.data.next);
      if (response.data.next == null) {
        setAnotherPage(false);
      }
      else {
        setAnotherPage(true)
      }
      if (response.data.prev == null) {
        setBackPage(false);
      }
      else {
        setBackPage(true);
      }
      setNonPostNotifications(filteredNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!userId) return; 

    fetchNotifications();
  }, [userId]); 

  useEffect(() => {
    fetchNotifications();
  }, [paginationNumber]);

  const clearNotifications = async () => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/authors/${userId}/inbox`);
      // const data = response.data.items.reverse();
      // const filteredNotifications = data.filter(notification => notification.type !== "post");
      // setNonPostNotifications(filteredNotifications);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  }

  const handleAcceptFollow = async (notification) => {
    console.log(`Accepting follow request from ${notification.actor.id}`);
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }
    
    const config = {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log(notification)
      await axios.post(`http://localhost:8000/api/authors/${userId}/acceptFollowRequest/`, notification, config);
      console.log("Follow request accepted successfully");

      let tempArray = nonPostNotifications.filter((tempNot) => {
        return notification != tempNot
      })
      setNonPostNotifications(tempArray);
    } catch (error) {
      console.error("Error accepting follow request: ", error.response?.data || error.message);
    }
  };

  return (
    <Box sx={{ pt: 9 }}>
      <div style={{ maxWidth: '1000px', margin: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent:"flex-end"}}>
          <Button variant='outlined' onClick={clearNotifications} sx={{alignItems: 'flex-end', display:'flex',justify: 'flex-end'}}>
            Clear Notifications
          </Button>
        </Box>
        {nonPostNotifications.map((notification, index) => (
          <Card key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={notification.author?.displayName || notification.actor?.displayName} src={notification.author?.profileImage || notification.actor?.profileImage} sx={{ marginRight: 2 }}/>
              <Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {notification.type === "Comment" ? `${notification.summary} - "${notification.comment}"` : notification.summary}
                </Typography>
              </Box>
            </CardContent>
            {notification.type === "Follow" && (
              <IconButton 
                color="primary" 
                onClick={() => handleAcceptFollow(notification)}
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
        <Box display="flex" justifyContent="center" alignItems="center">
            { backPage ? <ArrowBackIosNewIcon onClick={() => setPaginationNumber(paginationNumber - 1)}/> : ""}
            { anotherPage ? <ArrowForwardIosIcon onClick={() => setPaginationNumber(paginationNumber + 1)} /> : "" }
        </Box>
      </div>
    </Box>
  );
}

export default NotificationsPage;
