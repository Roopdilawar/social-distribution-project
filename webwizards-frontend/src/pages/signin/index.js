import React, { useState } from 'react';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import './styles.css';
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { useTheme } from '../../components/theme-context/index.js';
import LightModeIcon from '@mui/icons-material/LightMode'; 
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';


// Define a theme for styling
const theme = createTheme({
	palette: {
	  primary: {
		main: 'rgba(25, 118, 210, 1)', // Metallic Purple
		contrastText: '#000000', // Ensuring text on primary color is white
	  },
	  secondary: {
		main: '#000000', // Deep Green
	  },
	  info: {
		main: 'rgba(25, 118, 210, 0.9)', // Faded Green
	  },
	  background: {
		default: '#000000', // Deep Green background
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
  


export default function SignIn() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username: data.get('username'),
        password: data.get('password'),
      });
      console.log(response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        console.error('Login error', error);
        setError('An error occurred during login.');
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
        display: 'flex',
        backgroundColor: 'white',
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
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
          <source src={`${process.env.PUBLIC_URL}/loginhd.mp4`} type="video/mp4" />
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
          zIndex: 2,
        }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon sx={{ color: 'white' }} />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ textAlign: 'center', my: 2, color: 'primary.main' }}>
                Welcome to SocialDistribution!
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                  InputProps={{
                    style: {
                      borderColor: theme.palette.info.main,
                      color: theme.palette.text.primary,
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                  InputProps={{
                    style: {
                      borderColor: theme.palette.info.main,
                      color: theme.palette.text.primary,
                    },
                  }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Stack direction="column" justifyContent="space-between" spacing={2} sx={{ width: '100%' }}>
                  <Link href="#" variant="body2" sx={{ alignSelf: 'center', color: 'info.main' }}>
                    Forgot password?
                  </Link>
                  <Link href="signup" variant="body2" sx={{ alignSelf: 'center', color: 'info.main' }}>
                    Don't have an account? Sign Up
                  </Link>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2,  color: 'white' }}
                  >
                    Get Started
                  </Button>
                </Stack>
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