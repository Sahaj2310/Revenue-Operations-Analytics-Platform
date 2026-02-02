import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { Dashboard, Insights, People, Settings, AutoAwesome, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { logout } = useAuth();
    const isDark = theme.palette.mode === 'dark';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/' },
        { text: 'Analytics', icon: <Insights />, path: '/analytics' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Settings', icon: <Settings />, path: '/settings' },
    ];

    return (
        <Box sx={{
            width: 260,
            height: '100vh',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            {/* Logo Area */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #00C4FF, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0, 229, 255, 0.3)'
                }}>
                    <AutoAwesome sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5, color: 'text.primary' }}>
                    RevOps <span style={{ color: theme.palette.primary.main }}>AI</span>
                </Typography>
            </Box>

            {/* Menu */}
            <List sx={{ px: 2, mt: 2 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 3,
                                    bgcolor: active ? (isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(2, 132, 199, 0.1)') : 'transparent',
                                    color: active ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                                        color: 'text.primary'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ mt: 'auto', p: 3 }}>
                <Box sx={{
                    p: 2,
                    borderRadius: 3,
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0, 229, 255, 0.05))'
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(2, 132, 199, 0.05))',
                    border: 1,
                    borderColor: 'divider',
                    mb: 2
                }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 0.5 }}>Pro Plan</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                        You have 12 days left in your trial.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>
                        Upgrade Now →
                    </Typography>
                </Box>

                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 3,
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.lighter', color: 'error.dark' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </Box>
        </Box>
    );
};

export default Sidebar;
