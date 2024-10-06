import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import './styles.css';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { useTheme } from '../../components/theme-context/index.js';
import LightModeIcon from '@mui/icons-material/LightMode'; 
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { styled } from '@mui/system';



const theme = createTheme({
	palette: {
	  primary: {
		main: 'rgba(25, 118, 210, 1)', // Metallic Purple
		contrastText: '#000000', // Ensuring text on primary color is white
	  },
	  secondary: {
		main: '#2F3020', // Deep Green
	  },
	  info: {
		main: 'rgba(25, 118, 210, 0.9)', // Faded Green
	  },
	  background: {
		default: '#465048', // Deep Green background
	  },
	  text: {
		primary: '#000000',
		secondary: '#000000', // Faded Green for less prominent text
		}},	
	shape: {
	  borderRadius: 8, // Rounded corners for elements
	},
	components: {
	  MuiButton: {
		styleOverrides: {
		  root: {
			borderRadius: 20, // More rounded corners for buttons
		  },
		},
	  },
	},
  });


export default function SignUp() {
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const userData = {
          username: data.get('username'),
          email: data.get('email'),
          password: data.get('password'),
          password2: data.get('password2'),
          github: data.get('github'), 
        };
    
        try {
            setFormErrors({});
            const response = await axios.post('http://localhost:8000/api/signup/', userData);
            console.log(response.data);
            navigate('/signin');
        } catch (error) {
            if (error.response && error.response.data) {
                setFormErrors(error.response.data);
            } else {
                console.error('Registration error', error);
                setFormErrors({ general: 'An error occurred during registration.' });
            }
          }
      };

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column', // Adjust this to column to stack children vertically
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto', // Allow vertical scrolling
        zIndex: 1,
      }}>
        <video autoPlay loop muted preload="auto" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
          zIndex: -1,
        }}>
          <source src={'https://social-dist-vid.s3.us-west-2.amazonaws.com/loginhd.mp4'} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <Paper elevation={10} sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(30px)',
          minWidth: 300,
          maxWidth: 450,
          zIndex: 2, // Ensure it's above the video
        }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon sx={{ color: 'white' }} />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', my: 2, color: 'primary.main' }}>
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error={!!formErrors.email}
                helperText={formErrors.email}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={!!formErrors.password}
                helperText={formErrors.password}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                required
                fullWidth
                name="password2"
                label="Enter Password Again"
                type="password"
                id="password2"
                autoComplete="new-password2"
                error={!!formErrors.password2}
                helperText={formErrors.password2}
                />
            </Grid>
            <Grid item xs={12}>
            <TextField
                required
                fullWidth
                id="github"
                label="GitHub Username"
                name="github"
                autoComplete="github-username"
                error={!!formErrors.github}
                helperText={formErrors.github}
            />
        </Grid>

            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2,  color: 'white' }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
          </Paper>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2, mb: 4, zIndex: 2, width: '100%' }}>
              {'Copyright © '}
              <Link color="inherit" href="https://github.com/uofa-cmput404">
                WebWizards
              </Link>{' '}
              {new Date().getFullYear()}
              {'.'}
            </Typography>

          </Box>

      </ThemeProvider>
  );
}