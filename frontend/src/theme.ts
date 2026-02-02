import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          // Dark Mode
          background: {
            default: '#0B0F19',
            paper: '#111827',
          },
          primary: {
            main: '#00E5FF',
          },
          text: {
            primary: '#F3F4F6',
            secondary: '#9CA3AF',
          },
        }
      : {
          // Light Mode
          background: {
            default: '#F3F4F6',
            paper: '#FFFFFF',
          },
          primary: {
            main: '#0284C7', // Darker Blue for light mode
          },
          text: {
            primary: '#111827',
            secondary: '#6B7280',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#2d3748 #0B0F19' : '#CBD5E1 #F3F4F6',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? '#2d3748' : '#CBD5E1',
            minHeight: 24,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: mode === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
          }
        }
      }
    }
  },
});
