import React, { useEffect, useState } from "react";
import { TextField, InputLabel, FormControl, OutlinedInput } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import "./styles.css";

export default function FollowersPage (props) {
    const [searchTerm, setSearchTerm] = useState("");

    const fakeFollowersData = [
        {
            displayName: "Julie Pilz",
            id: "1"
        },
        {
            displayName: "Neville Albuquerque",
            id: "2"
        },
        {
            displayName: "Swastik Sharma",
            id: "3"
        },
        {
            displayName: "Kannan Khosla",
            id: "4"
        },
        {
            displayName: "Roopdilawar",
            id: "5"
        }
    ]

    useEffect(() => {
        // TODO: FETCH all users that include search term
        // Alternative implementation: Fetch all users and filter, less efficient
    }, [searchTerm])

    return(
        <div className="followers-page">
            <h1>
                Find new followers.
            </h1>
            <div className="comment-info">
                <span className="comment-input">
                    <FormControl fullWidth>
                    <InputLabel>Search For Followers</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-amount"
                        label="Search For Followers"
                    />
                    </FormControl>
                </span>
                <span>
                    <SearchIcon/>
                </span>
            </div>
            <div className="users-container">
                {fakeFollowersData.map((user) => (
                    <div className="displayed-user">
                        <img src="" alt="profile" className="profile-pic" />
                        <div className="post-info">
                            <span className="username">{user.displayName}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}