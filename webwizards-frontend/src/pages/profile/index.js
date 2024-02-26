import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';

import { TimelinePost } from '../../components/timeline-post/index.js';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const posts = [
    {
        title:"Text Post 1",
        id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e",
        source:"http://lastplaceigotthisfrom.com/posts/yyyyy",
        origin:"http://whereitcamefrom.com/posts/zzzzz",
        description:"Þā wæs on burgum Bēowulf Scyldinga, lēof lēod-cyning, longe þrāge folcum gefrǣge (fæder ellor hwearf, aldor of earde), oð þæt him eft onwōc hēah Healfdene; hēold þenden lifde, gamol and gūð-rēow, glæde Scyldingas. Þǣm fēower bearn forð-gerīmed in worold wōcun, weoroda rǣswan, Heorogār and Hrōðgār and Hālga til; hȳrde ic, þat Elan cwēn Ongenþēowes wæs Heaðoscilfinges heals-gebedde. Þā wæs Hrōðgāre here-spēd gyfen, wīges weorð-mynd, þæt him his wine-māgas georne hȳrdon, oð þæt sēo geogoð gewēox, mago-driht micel. Him on mōd bearn, þæt heal-reced hātan wolde, medo-ærn micel men gewyrcean, þone yldo bearn ǣfre gefrūnon, and þǣr on innan eall gedǣlan geongum and ealdum, swylc him god sealde, būton folc-scare and feorum gumena. Þā ic wīde gefrægn weorc gebannan manigre mǣgðe geond þisne middan-geard, folc-stede frætwan. Him on fyrste gelomp ǣdre mid yldum, þæt hit wearð eal gearo, heal-ærna mǣst; scōp him Heort naman, sē þe his wordes geweald wīde hæfde. Hē bēot ne ālēh, bēagas dǣlde, sinc æt symle. Sele hlīfade hēah and horn-gēap: heaðo-wylma bād, lāðan līges; ne wæs hit lenge þā gēn þæt se ecg-hete āðum-swerian 85 æfter wæl-nīðe wæcnan scolde. Þā se ellen-gǣst earfoðlīce þrāge geþolode, sē þe in þȳstrum bād, þæt hē dōgora gehwām drēam gehȳrde hlūdne in healle; þǣr wæs hearpan swēg, swutol sang scopes. Sægde sē þe cūðe frum-sceaft fīra feorran reccan",
        published:"2024-01-15",
        contentType:"text/plain",
        author:{
            type:"author",
            // ID of the Author
            id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
            // the home host of the author
            host:"http://127.0.0.1:5454/",
            // the display name of the author
            displayName:"Lara Croft",
            // url to the authors profile
            url:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
            // HATEOS url for Github API
            github: "http://github.com/laracroft",
            // Image from a public domain (optional, can be missing)
            profileImage: "https://i.imgur.com/k7XVwpB.jpeg"
        },
    },
    {
        title:"Image post 2",
        id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3b111e",
        source:"http://lastplaceigotthisfrom.com/posts/yyyyy",
        origin:"http://whereitcamefrom.com/posts/zzzzz",
        description:"This post has an image",
        published:"2024-01-15",
        contentType:"text/plain",
        imageUrl:"https://i.imgur.com/P9OOMAn.jpeg",
        
        author:{
            type:"author",
            // ID of the Author
            id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40699f",
            // the home host of the author
            host:"http://127.0.0.1:5454/",
            // the display name of the author
            displayName:"Lara Croft",
            // url to the authors profile
            url:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
            // HATEOS url for Github API
            github: "http://github.com/laracroft",
            // Image from a public domain (optional, can be missing)
            profileImage: "https://i.imgur.com/k7XVwpB.jpeg"
        },
    },
    {
        title:"CommonMark post 3",
        id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bb88e",
        source:"http://lastplaceigotthisfrom.com/posts/yyyyy",
        origin:"http://whereitcamefrom.com/posts/zzzzz",
        description:"# Welcome to My Blog \n ## This is a Subheader\n Here's some regular text with **bold** and *italic* formatting. \n Image inside text: ![Post image](https://fas.org/wp-content/uploads/2023/06/NASA-Apollo8-Dec24-Earthrise.jpeg)",
        published:"2024-01-18",
        contentType:"text/commonMark",
        author:{
            type:"author",
            // ID of the Author
            id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
            // the home host of the author
            host:"http://127.0.0.1:5454/",
            // the display name of the author
            displayName:"Lara Croft",
            // url to the authors profile
            url:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
            // HATEOS url for Github API
            github: "http://github.com/laracroft",
            // Image from a public domain (optional, can be missing)
            profileImage: "https://i.imgur.com/k7XVwpB.jpeg"
        },
    }
];

function UserProfile() {
    const [user, setUser] = useState({
        name: 'scorpion',
        fullName: 'Justin Fuddu',
        followers: 150,
        following: 75,
        posts: [],
        bio: 'The only way out is through.'
    });
    const [open, setOpen] = useState(false);
    const [bio, setBio] = useState(user.bio);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        setUser({ ...user, bio: bio });
        handleClose();
    };

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    // New states for modals
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    // Functions to handle modal open/close
    const handleFollowersOpen = () => setShowFollowers(true);
    const handleFollowersClose = () => setShowFollowers(false);
    const handleFollowingOpen = () => setShowFollowing(true);
    const handleFollowingClose = () => setShowFollowing(false);

    // Modal style
    const modalStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
    };

    return (
        <ThemeProvider theme={createTheme()}>
        <Container component="main">
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 2,
                marginBottom: 2,
            }}>
                <Avatar src="https://i.pinimg.com/originals/9c/90/be/9c90be4949b0f0a02b404481f6adc347.jpg" sx={{ width: 200, height: 200, borderRadius: '50%' }} />
                <Typography component="h1" variant="h5" sx={{
                    fontSize: '2.25em',
                    marginTop: 1,
                    fontFamily:'Garamond',
                    fontWeight: 'bold',
                }}>
                    {user.fullName}
                </Typography>
                <div style={{ marginTop: '20px' }} />
                <Box sx={{ marginTop: 1, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{
                    fontSize: '1em',
                    marginTop: 1,
                    fontFamily: 'Futura', 
                    fontWeight: 'italica',
                    }}>
                        {user.bio}
                    </Typography>
                    <Button variant="outlined" onClick={handleOpen} sx={{ marginTop: 1, marginBottom: 2 }}>
                        Edit Bio
                    </Button>
                </Box>

                <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Bio</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can update your bio information here.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="bio"
                        label="Bio"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={bio}
                        onChange={handleBioChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

                <div style={{ marginTop: '40px' }} />

                {/* Followers and Following buttons with onClick handlers */}
                <Grid container spacing={4} justifyContent="center">
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, '&:hover': { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', cursor: 'pointer' } }} onClick={handleFollowingOpen}>
                            following: {user.following}
                        </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, '&:hover': { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', cursor: 'pointer' } }} onClick={handleFollowersOpen}>
                            followers: {user.followers}
                        </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2 }} >
                            posts: {user.posts.length}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Followers Modal */}
                <Modal open={showFollowers} onClose={handleFollowersClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Followers</Typography>
                        {/* Render followers list here */}
                    </Box>
                </Modal>

                {/* Following Modal */}
                <Modal open={showFollowing} onClose={handleFollowingClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6">Following</Typography>
                        {/* Render following list here */}
                    </Box>
                </Modal>        

                <div style={{ marginTop: '40px' }} />
                <div style={{ maxWidth: '1000px', margin: 'auto' }}>
                    {posts.map(post => (
                        <TimelinePost key={post.id} post={post} />
                    ))}
                </div>
            </Box>
        </Container>
    </ThemeProvider>
);
};


export default UserProfile;