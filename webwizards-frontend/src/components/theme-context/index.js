import React, { createContext, useContext, useState } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : 'dark';
  });

  const scrollbarStyles = `
    ::-webkit-scrollbar {
      width: 10px; /* Adjusting for a slimmer scrollbar */
    }
    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #A0A0A0; 
      border-radius: 20px; /* Making it more rounded to ensure a pill shape */
      border: 3px solid transparent; /* Adjusting border size for floating effect */
      background-clip: padding-box; /* This might help in getting the desired visual */
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: #909090;
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: #A0A0A0 transparent;
    }
  `;

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: scrollbarStyles,
      },
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
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
