import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Switch, FormControlLabel, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

function EditPost({ isOpen, handleClose, post }) {
    const token = localStorage.getItem('token');

    const [title, setTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [useMarkdown, setUseMarkdown] = useState(false);
    const [visibility, setVisibility] = useState('Public');
    const [base64Image, setBase64Image] = useState('');
    const initialOpen = useRef(true);

    useEffect(() => {
        if (post && isOpen && initialOpen.current) {
            console.log('bad!')
            setTitle(post.title);
            setVisibility(post.visibility);
            setUseMarkdown(post.content_type === "text/markdown");
            if (post.content_type === "image/base64") {
                setBase64Image(post.content);
            } else {
                setPostContent(post.content);
            }
            initialOpen.current = false; 
        }
        if (!isOpen) {
            initialOpen.current = true;
        }
    }, [post, isOpen]); 
    
    const handleInputChange = (event) => {
        setPostContent(event.target.value);
    };

    const handleMarkdownToggle = (event) => {
        setUseMarkdown(event.target.checked);
    };

    const handleTitleChange = (event) => {
        console.log('good')
        setTitle(event.target.value);
    };
    
    const handleVisibilityChange = (event) => {
        setVisibility(event.target.value);
    };
    
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
        const editedPostData = {
            title: title,
            content_type: base64Image ? "image/base64" : (useMarkdown ? "text/markdown" : "text/plain"),
            content: base64Image || postContent,
            visibility: visibility
        };

        const config = {
            headers: {
                'Authorization': `Token ${token}`
            }
        };

        try {
            const postId = post.id.split('/').pop();
            const response = await axios.put(`http://localhost:8000/api/authors/${post.id.split('/authors/')[1].split('/')[0]}/posts/${postId}/`, editedPostData, config);
            console.log(response.data);
            handleClose(); 
        } catch (error) {
            console.error("Error updating post: ", error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth="md" sx={{ '& .MuiDialog-paper': { minWidth: '80%' } }}>
            <DialogTitle id="form-dialog-title">Edit Post</DialogTitle>
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
        label="Use Markdown"
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
    {!useMarkdown && base64Image && (
        <Box mt={2}>
            <img
                src={base64Image}
                alt="Uploaded"
                style={{ maxWidth: '100%' }}
            />
            <Button
                variant="contained"
                component="label"
                sx={{ mt: 2 }}
            >
                Upload New Image
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </Button>
        </Box>
    )}
    {!useMarkdown && !base64Image && (
        <Button
            variant="contained"
            component="label"
            fullWidth
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
</DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditPost;
