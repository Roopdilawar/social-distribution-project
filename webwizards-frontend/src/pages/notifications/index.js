import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, Typography, Avatar, IconButton, Button, Tooltip, Grow, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import ClearAllIcon from '@mui/icons-material/ClearAll'; 
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
  const [loading, setLoading] = useState(true);

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

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/inbox?page=${paginationNumber}`);
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
      setLoading(false);
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
      const response = await axios.delete(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/inbox`);
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
      await axios.post(`https://social-distribution-95d43f28bb8f.herokuapp.com/api/authors/${userId}/acceptFollowRequest/`, notification, config);
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
    <Box sx={{ pt: 9, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ maxWidth: '600px', width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="outlined" startIcon={<ClearAllIcon />} onClick={clearNotifications}>
          Clear all notifications
        </Button>
      </Box>
      {
        loading ?
        <Box sx={{ pt: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "12%" }}>
                <img src="https://imgur.com/KX0kfY9.png" alt="Logo" style={{ height: '40px', marginRight: '0px' }} />
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    fontFamily: 'Lexend',
                    paddingBottom: '20px',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                    }}
                >
                    SocialDistribution
                </Typography>
                <CircularProgress className='loading-screen'/> 
        </Box>

          :
          <>
            {nonPostNotifications.length > 0 ? (
                nonPostNotifications.map((notification, index) => (
                  <Grow in={!loading} timeout={1000}>
                    <Card key={index} sx={{ mb: 2, width: '60%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: { xs: 1, sm: 0 } }}>
                        <Avatar alt={notification.actor?.displayName} src={notification.actor?.profileImage} sx={{ marginRight: 2 }}/>
                        <Typography variant="body1">
                          {notification.summary}
                        </Typography>
                      </Box>
                      {notification.type === "Follow" && (
                        <Box>
                          <Button variant="contained" color="primary" onClick={() => handleAcceptFollow(notification)} startIcon={<CheckCircleIcon />}>
                            Accept
                          </Button>
                        </Box>
                      )}
                    </Card>
                  </Grow>
                ))
            ) : (
              <Typography sx={{ mt: 2 }}>No notifications</Typography>
            )}
            </>
      }
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '600px', mt: 2 }}>
        {backPage && (
          <IconButton onClick={() => setPaginationNumber(paginationNumber - 1)} size="large">
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
        {anotherPage && (
          <IconButton onClick={() => setPaginationNumber(paginationNumber + 1)} size="large">
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default NotificationsPage;