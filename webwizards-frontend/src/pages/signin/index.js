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
          <source src={'https://webwizardsvideo.s3.us-west-2.amazonaws.com/loginhd.mp4?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQDmuxfUDb%2Bxj9JawuioFZeWon7rcalwMIae%2FT15eM6zUQIgDt7yBr0i7aWFfpIMpfKZMye7GXCBRqDm8NCyukEfozQq5AIIMxAAGgw5MDU0MTg0NjQ5NzIiDIOCEoJ0lrmHIKXEJirBAl%2FV9CsHSZdxsB%2FOh10W0OIzIBGYtlql8%2Fwvaascx6XgQeR6MxekhF9s2glkyrE3cyyW6PWaDSKpBEA%2BWxPFfQfwgrk%2FrHz45gNhXdMv4G1KcpYmUwfRHr84kUFu8D5KR4VP%2FnM8ps%2BdHUKlM90z%2BMG0CpEcR0dctXla9ECPwtBj8RpDT0H5WP14k0gT03lIWlWLDtuIyijMF9%2F5Nt4TjnLKre%2BsbAsvSWxcw22h1KAwk1Z5JO%2Fpht4c5hwWRnYvjciWCTf%2FxslOg87yGs4v6AC8m5Bb7G7UG1kVP5IEDHTDYoi%2BfDTL8%2B6r3%2Fd%2F9ObRxtFVzkEUABz53dAglrtMavjgCbDH2znGznZw9GxZ%2Fdg4Zt7gWywYky2I0eOYyZqcfyibmts8%2FjzIy%2BTvQ8nDEvOiPOI7cTvgRHc0E%2BT7mNRXIzCDmNuwBjqzApUyMZN67MH02rAHmW9TC6sa97Wi5aRRgdduesQENteFToQ8VL8RcPLuBnBHrxrCbQRaf1e5fR8sB5oTweuITVEyVChHmhnHaWqFUNEoap3n27%2Fg%2FUsWgIWZ%2F5iRMgZa2zCf92lv%2FYqOmQc45vjQJ0ozczks6Zt%2BGVTdGC73lL45EhKJmPzB0x4941cQS1rZHcCeyf1OAvJqIf9Eyvz22GCqlxK2hztZYG2eeZetg1UopvQUhXHO8huuVD7EmfQ2V7X62rLynDt81oUIIHAI9PDGvunmr4ZWzGAd4s3qyWZivObY5Cw1CKUaNlXedwVd8LSwRbBuxrOk9u4vMpwzwnLnv6JHkIzRWjt7nf5LUb3kqxGbWt9CC%2FnR9swDEIXsS5nHwZ%2FZv7YGbFjtQMebpuiy28M%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240410T173210Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIA5FTZFL3GDD5GCEHH%2F20240410%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=7b974d44b9cd7422eeb40b6019677a187b9533e6802b969317ddfeb9d4b0e315'} type="video/mp4" />
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