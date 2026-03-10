import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          // Dark Mode (Sana AI / Deep Dark)
          background: {
            default: '#0A0A0A',
            paper: '#141414',
          },
          primary: {
            main: '#FFFFFF', // High contrast primary
          },
          secondary: {
            main: '#333333',
          },
          text: {
            primary: '#F3F4F6',
            secondary: '#A1A1AA',
          },
          divider: 'rgba(255,255,255,0.08)',
        }
      : {
          // Light Mode (Mobbin / BaseTen Clean)
          background: {
            default: '#F9FAFB',
            paper: '#FFFFFF',
          },
          primary: {
            main: '#09090B', // Deep black for light mode primary
          },
          secondary: {
            main: '#F4F4F5',
          },
          text: {
            primary: '#09090B',
            secondary: '#71717A',
          },
          divider: 'rgba(0,0,0,0.06)',
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "system-ui", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    h1: { fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#333 #0A0A0A' : '#E4E4E7 #F9FAFB',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? '#333' : '#E4E4E7',
            minHeight: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill shaped buttons
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: mode === 'dark' ? '#FFFFFF' : '#09090B',
          color: mode === 'dark' ? '#000000' : '#FFFFFF',
          '&:hover': {
            backgroundColor: mode === 'dark' ? '#E5E5E5' : '#27272A',
          },
        },
        outlined: {
          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          color: mode === 'dark' ? '#FFFFFF' : '#09090B',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
          backgroundImage: 'none',
          boxShadow: mode === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiOutlinedInput: {
       styleOverrides: {
         root: {
           borderRadius: 12,
           '& .MuiOutlinedInput-notchedOutline': {
             borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
           },
           '&:hover .MuiOutlinedInput-notchedOutline': {
             borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
           },
         }
       }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          },
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            }
          }
        }
      }
    }
  },
});
