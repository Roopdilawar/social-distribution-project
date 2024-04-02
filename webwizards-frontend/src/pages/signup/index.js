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
import Container from '@mui/material/Container';

const theme = createTheme({
	palette: {
	  primary: {
		main: '#22685C', // Metallic Purple
		contrastText: '#000000', // Ensuring text on primary color is white
	  },
	  secondary: {
		main: '#2F3020', // Deep Green
	  },
	  info: {
		main: '#465048', // Faded Green
	  },
	  background: {
		default: '#465048', // Deep Green background
	  },
	  text: {
		primary: '#465048',
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

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/uofa-cmput404">
        WebWizards
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


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
        position: 'fixed', // or 'absolute', depending on your needs
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 1, // Ensure it's above other content, adjust as needed
      }}>
        <video autoPlay loop muted style={{
          position: 'absolute',
          width: '100%',
          left: '50%',
          top: '50%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
        }}>
      <source src={`${process.env.PUBLIC_URL}/loginhd.mp4`} type="video/mp4" />
      Your browser does not support the video tag.
      </video>
          <Paper elevation={20} sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background
            backdropFilter: 'blur(30px)', 
            minWidth: 300, // Ensure the form has a minimum width
            maxWidth: 450, 
          }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
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
              sx={{ mt: 3, mb: 2 }}
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
          </Box>

        
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 'auto', width: '100%', pt: 4 }}>
		      <Copyright sx={{ mt: 8, mb: 4 }} />
          </Typography>
      </ThemeProvider>
  );
}
