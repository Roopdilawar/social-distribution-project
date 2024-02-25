import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Switch, FormControlLabel, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

function NewPost({ isOpen, handleClose }) {
    const token = localStorage.getItem('token');

    const [postContent, setPostContent] = useState('');
    const [useMarkdown, setUseMarkdown] = useState(false);
    const [title, setTitle] = useState('');
    const [visibility, setVisibility] = useState('Public');

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

    const handleSubmit = async () => {
        console.log(token)
        const postData = {
            title: title,
            source: "http://localhost:8000/",
            origin: "http://localhost:8000/", 
            description: "Test Post", 
            content_type: useMarkdown ? "text/markdown" : "text/plain",
            content: postContent,
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
            const response = await axios.post('http://localhost:8000/api/posts/', postData, config);
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
                        <MenuItem value="Public">Public</MenuItem>
                        <MenuItem value="Private">Private</MenuItem>
                        <MenuItem value="Friends">Friends</MenuItem>
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
