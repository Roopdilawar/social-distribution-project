import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, Avatar, CardMedia, CardContent, Typography, IconButton, Tooltip, CardActions} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Share from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NewPost from '../postcreation/index.js';
import PostDetailModal from "../../components/post-detail-modal";


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


const TimelinePage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/posts/');
                const orderedPosts = response.data.items.sort((a, b) => new Date(b.published) - new Date(a.published));
                setPosts(orderedPosts);
            } catch (error) {
                console.error("Error fetching posts: ", error);
            }
        };

        fetchPosts();
    }, []);

    console.log(posts)

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            {posts.map(post => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
};


const Post = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const toggleModal = () => {
        console.log("Modal Clicked")
        setIsModalOpen(!isModalOpen);
    };

    const renderContent = () => {
        switch (post.content_type) {
            case 'text/plain':
                return <Typography variant="body2">{post.description}</Typography>;
            case 'text/commonMark':
                return <ReactMarkdown>{post.description}</ReactMarkdown>;
            default:
                return <Typography variant="body2">Unsupported content type</Typography>;
        }
    };

    return (
        <>
        <Card sx={{ marginBottom: 1, '&:hover': { boxShadow: 6 } }} >
            <CardHeader
                avatar={<Avatar src={post.author.profileImage} alt={post.author.displayName} />}
                title={<Typography variant="subtitle2" color="primary">{post.author.displayName}</Typography>}
                subheader={<Typography variant="caption">{new Date(post.published).toLocaleString()}</Typography>}
                action={
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                }
            />
            {post.imageUrl && <CardMedia component="img" image={post.imageUrl} alt={post.title} />}
            <CardContent>
                <Typography variant="h6" color="textPrimary" gutterBottom>
                    {post.title}
                </Typography>
                {renderContent()}
            </CardContent>
            <CardActions disableSpacing>
                <Tooltip title="Like">
                    <IconButton aria-label="like" onClick={handleLike} color={isLiked ? "error" : "default"}>
                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Comment">
                    <IconButton aria-label="comment" onClick={toggleModal}>
                        <ChatBubbleOutlineIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                    <IconButton aria-label="share">
                        <Share />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
        <PostDetailModal isModalOpen={isModalOpen} onClose={toggleModal} post={post} />
        </>
    );
};

export default TimelinePage;




