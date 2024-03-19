import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Switch, FormControlLabel, Typography, Select, MenuItem, InputLabel, FormControl, Zoom } from '@mui/material';

function NewPost({ isOpen, handleClose }) {
    const token = localStorage.getItem('token');

    const [postContent, setPostContent] = useState('');
    const [useMarkdown, setUseMarkdown] = useState(false);
    const [title, setTitle] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [base64Image, setBase64Image] = useState('');
    const [userId, setUserId] = useState(null);

    const handleInputChange = (event) => {
        setPostContent(event.target.value);
    };

    const handleMarkdownToggle = (event) => {
        setUseMarkdown(event.target.checked);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };
    
    const handleVisibilityChange = (event) => {
        setVisibility(event.target.value);
    };   

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
    
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBase64Image(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };    

    const handleSubmit = async () => {
        console.log(token)
        const postData = {
            title: title,
            source: "http://localhost:8000/",
            origin: "http://localhost:8000/", 
            description: "Test Post", 
            content_type: base64Image ? "image/base64" : (useMarkdown ? "text/markdown" : "text/plain"),
            content: base64Image || postContent,
            comment_counts: 0, 
            published: new Date().toISOString(), 
            visibility: visibility
        };
        
        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };    

        try {
            const response = await axios.post(`http://localhost:8000/api/authors/${userId}/posts/`, postData, config);
            console.log(response.data);
            handleClose(); 
        } catch (error) {
            console.error("Error submitting post: ", error);
        }
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={handleClose} 
            aria-labelledby="form-dialog-title"
            fullWidth={true}
            maxWidth="md" 
            sx={{ '& .MuiDialog-paper': { minWidth: '80%' } }} 
            TransitionComponent={Zoom} 
            transitionDuration={400}
        >
            <DialogTitle id="form-dialog-title">Create a New Post</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Title"
                    type="text"
                    fullWidth
                    value={title}
                    onChange={handleTitleChange}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel id="visibility-label">Visibility</InputLabel>
                    <Select
                        labelId="visibility-label"
                        id="visibility"
                        value={visibility}
                        label="Visibility"
                        onChange={handleVisibilityChange}
                    >
                        <MenuItem value="PUBLIC">Public</MenuItem>
                        <MenuItem value="UNLISTED">Private</MenuItem>
                        <MenuItem value="FRIENDS">Friends</MenuItem>
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={<Switch checked={useMarkdown} onChange={handleMarkdownToggle} />}
                    label="Use CommonMark"
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="postContent"
                    label="Your Post"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={postContent}
                    onChange={handleInputChange}
                />
                {useMarkdown && <Typography variant="body2">Preview:</Typography>}
                {useMarkdown && <ReactMarkdown>{postContent}</ReactMarkdown>}
                {!useMarkdown && (
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ mt: 2 }}
                    >
                        Upload Image
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Button>
                )}
                {base64Image && (
                    <img
                        src={base64Image}
                        alt="Uploaded"
                        style={{ maxWidth: '100%', marginTop: '20px' }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Post
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default NewPost;
