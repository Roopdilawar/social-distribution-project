import React, { useState } from "react";
import TimelinePost from "../../components/timeline-post";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@mui/material";
import NewPost from '../postcreation/index.js';
import "./styles.css";

export default function TimelinePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const fakePostArray = [
        {
            title:"A post title about a post about web dev",
            id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e",
            source:"http://lastplaceigotthisfrom.com/posts/yyyyy",
            origin:"http://whereitcamefrom.com/posts/zzzzz",
            description:"This post discusses stuff -- brief",
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
            title:"Test post 2",
            id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3b111e",
            source:"http://lastplaceigotthisfrom.com/posts/yyyyy",
            origin:"http://whereitcamefrom.com/posts/zzzzz",
            description:"This post discusses stuff -- brief",
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
            title:"Test post 3",
            id:"http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bb88e",
            source:"http://lastplaceigotthisfrom.com/posts/yyyyy",
            origin:"http://whereitcamefrom.com/posts/zzzzz",
            description:"This post discusses stuff -- brief",
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

    return (
        <div className="timeline-page">
            <h1>
                Welcome to your timeline.
            </h1>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={toggleModal}
                style={{ marginBottom: '20px' }} 
            >
                Create New Post
            </Button>
            <NewPost isOpen={isModalOpen} handleClose={toggleModal} />
            {fakePostArray.map((arrayItem) => (
                <TimelinePost 
                    className="timeline-element" 
                    title={arrayItem.title} 
                    description={arrayItem.description} 
                    author={arrayItem.author.displayName} 
                    key={arrayItem.id}
                />
            ))}
        </div>
    );
}
