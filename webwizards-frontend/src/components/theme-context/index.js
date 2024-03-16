import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : 'dark';
  });

  // Define custom theme that adapts based on the mode
  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
    components: {
      // You can extend the theme with custom components here
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `2px solid ${theme.palette.mode === 'dark' ? 'lightblue' : 'lightgreen'}`,
            color: theme.palette.mode === 'dark' ? 'lightblue' : 'lightgreen',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(173, 216, 230, 0.1)' : 'rgba(144, 238, 144, 0.1)',
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      // Add more component overrides if needed
    },
  });

  const toggleTheme = () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    localStorage.setItem('themeMode', newThemeMode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline /> {/* Ensures consistent baseline styles across browsers */}
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
