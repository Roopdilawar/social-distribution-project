import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Switch, FormControlLabel, Typography } from '@mui/material';

function NewPost({ isOpen, handleClose }) {
    const [postContent, setPostContent] = useState('');
    const [useMarkdown, setUseMarkdown] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleInputChange = (event) => {
        setPostContent(event.target.value);
    };

    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleMarkdownToggle = (event) => {
        setUseMarkdown(event.target.checked);
    };

    const handleSubmit = () => {
        // Implement your submit logic here
        console.log(postContent, selectedImage);
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={handleClose} 
            aria-labelledby="form-dialog-title"
            fullWidth={true}
            maxWidth="md" // You can change this to 'sm', 'md', 'lg', or 'xl' as needed
            sx={{ '& .MuiDialog-paper': { minWidth: '80%' } }} // Optional: for more precise control
        >
            <DialogTitle id="form-dialog-title">Create a New Post</DialogTitle>
            <DialogContent>
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
                <Button
                    variant="contained"
                    component="label"
                >
                    Upload Image
                    <input
                        type="file"
                        hidden
                        onChange={handleImageChange}
                    />
                </Button>
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
