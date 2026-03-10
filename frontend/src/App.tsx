import { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';
import { ColorModeProvider, useColorMode } from './context/ColorModeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
    const { mode } = useColorMode();
    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                                <Sidebar />
                                <Box component="main" sx={{ 
                                    flexGrow: 1, 
                                    ml: { xs: 0, md: '260px' }, 
                                    p: { xs: 2, md: 4, lg: 6 }, 
                                    overflowX: 'hidden',
                                    maxWidth: '1600px',
                                    margin: '0 auto',
                                    width: '100%'
                                }}>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/customers" element={<Customers />} />
                                        <Route path="/settings" element={<Settings />} />
                                    </Routes>
                                </Box>
                            </Box>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

function App() {
    return (
        <ColorModeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ColorModeProvider>
    );
}

export default App;
