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
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define a theme for styling
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


export default function SignIn() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        <Paper elevation={10} sx={{
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
                Have an account?
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
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Get Started
                  </Button>
                </Stack>
              </Box>
            </Paper>
            </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 'auto', width: '100%', pt: 4 }}>
		<Copyright sx={{ mt: 8, mb: 4 }} />
        </Typography>
                  
    </ThemeProvider>
  );
}
