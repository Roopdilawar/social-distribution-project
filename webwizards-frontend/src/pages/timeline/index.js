import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Switch, Pagination, CircularProgress, Grow } from '@mui/material';
import { TimelinePost } from '../../components/timeline-post';
import { TimelineRepost } from '../../components/timeline-repost';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const TimelinePage = () => {
    const [posts, setPosts] = useState([]);
    const [isFollowingView, setIsFollowingView] = useState(false);
    const [userId, setUserId] = useState(null);
    const [serverCredentials, setServerCredentials] = useState([]);
    const [postsPage, setPostsPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchServerCredentials = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/server-credentials/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setServerCredentials(response.data);
        } catch (error) {
            console.error("Error fetching server credentials:", error);
        }
    };

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
                console.error("Error fetching user ID:", error);
            }
        };
        
        fetchUserId();
        fetchServerCredentials();
    }, []);

    const fetchFirstPage = async () => {
        let tempPosts = [];

        if (isFollowingView) {
            try {
                const response = await axios.get(`http://localhost:8000/api/authors/${userId}/inbox?page=1&size=5`, {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                });
                const filteredPosts = response.data.items.filter(item => item.type === 'post');
                const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                for (let sortedPost of orderedPosts) {
                    tempPosts.push(sortedPost)
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        }

        else {
            for (let [url, credentials] of Object.entries(serverCredentials)) {
                let tempEndpoint = url + 
                (url === 'https://deadly-bird-justin-ce5a27ea0b51.herokuapp.com/' ? 'api/posts/public/' : 
                url === 'https://depresso-espresso-7e0a859d2d18.herokuapp.com/' ? 'api/posts' : 'api/posts/') + 
                `?page=1&size=5`;                
                try {
                    const response = await axios.get(tempEndpoint, {
                        auth: {
                            username: credentials.outgoing_username,
                            password: credentials.outgoing_password
                        }
                    });
                    const filteredPosts = response.data.items
                    const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    for (let sortedPost of orderedPosts) {
                        tempPosts.push(sortedPost)
                    }
                } catch (error) {
                    console.error(`Error fetching posts from ${url}:`, error);
                }                
            }
        }
        setPosts(tempPosts.sort((a, b) => new Date(b.published) - new Date(a.published)));
        setLoading(false);
    }

    const fetchPosts = async () => {
        let tempPosts = [];
        let tempOverflowPosts = [];

        if (isFollowingView) {
            let tempPaginationNumber = 1;
            let morePages = true;

            try {
                while (morePages) {
                    const response = await axios.get(`http://localhost:8000/api/authors/${userId}/inbox?page=${tempPaginationNumber}`, {
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`
                        }
                    });
                    const filteredPosts = response.data.items.filter(item => item.type === 'post');
                    const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                    for (let sortedPost of orderedPosts) {
                        tempPosts.push(sortedPost)
                    }
                    if (response.data.next == null) {
                        morePages = false;
                    }
                    tempPaginationNumber++;
                }
            } catch (error) {
                morePages = false;
                console.error("Error fetching posts:", error);
            }
        }

        else {
            for (let [url, credentials] of Object.entries(serverCredentials)) {
                let tempPaginationNumber = 1;
                let morePages = true;

                while (morePages) {
                    let tempEndpoint = url + 
                    (url === 'https://deadly-bird-justin-ce5a27ea0b51.herokuapp.com/' ? 'api/posts/public/' : 
                    url === 'https://depresso-espresso-7e0a859d2d18.herokuapp.com/' ? 'api/posts' : 'api/posts/') + 
                    `?page=${tempPaginationNumber}`;                    try {
                        const response = await axios.get(tempEndpoint, {
                            auth: {
                                username: credentials.outgoing_username,
                                password: credentials.outgoing_password
                            }
                        });
                        const filteredPosts = response.data.items
                        const orderedPosts = filteredPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
                        for (let sortedPost of orderedPosts) {
                            tempPosts.push(sortedPost)
                        }
                        tempPaginationNumber++;
                    } catch (error) {
                        morePages = false;
                        console.error(`Error fetching posts from ${url}:`, error);
                    }
                }
                
            }
        }
        setPosts(tempPosts.sort((a, b) => new Date(b.published) - new Date(a.published)));
    };

    useEffect(() => {
        if (!userId) return;
        fetchServerCredentials();
        fetchFirstPage();
        fetchPosts();
        const intervalId = setInterval(fetchPosts, 1000000000000000000000000);
        return () => clearInterval(intervalId);
    }, [isFollowingView, userId]);

    useEffect(() => {
        setLoading(true);
        setPostsPage(0);
    }, [isFollowingView])

    const handleChangePage = (event, value) => {
        setPostsPage(value - 1);
    };

    return (
      <Box sx={{ pt: 9, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ maxWidth: '1000px', width: '100%', margin: 'auto', paddingBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ marginRight: 2 }}>Explore</Typography>
              <Switch checked={isFollowingView} onChange={(event) => setIsFollowingView(event.target.checked)} />
              <Typography variant="body1" sx={{ marginLeft: 2 }}>Following</Typography>
          </Box>
          {loading 
          ?
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
          {posts.length > 0 ? (
            <Grow in={!loading} timeout={1000}>
              <Box sx={{ maxWidth: '1000px', width: '100%', margin: 'auto' }}>
                  {posts.slice(postsPage * 5, (postsPage * 5) + 5).map((post) => {
                      if (post.origin == post.source) {
                          return <TimelinePost key={post.id} post={post} detailedView={false}/>;
                      }
                      else {
                          let originalPost = posts.filter((ogPost) => ogPost.origin === post.origin && ogPost.id != post.id);

                          if (originalPost.length > 0) {
                              return <TimelineRepost key={post.id} post={post} detailedView={false} originalPost={originalPost[0]}/>;
                          }
                      }
                  })}
              </Box>
            </Grow>
          ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 4 }}>
                  <Typography>No posts to display...</Typography>
              </Box>
          )}
          {posts.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2, mb: 2 }}>
                  <Pagination
                      count={Math.ceil(posts.length / 5)}
                      page={postsPage + 1}
                      onChange={(event, value) => setPostsPage(value - 1)}
                      variant="outlined"
                      color="primary"
                      showFirstButton
                      showLastButton
                  />
              </Box>
          )}
          </>
        }
      </Box>
    );
};

export default TimelinePage;
