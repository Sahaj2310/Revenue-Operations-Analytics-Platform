import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { Dashboard, Insights, People, Settings, AutoAwesome, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onOpenCopilot }: { onOpenCopilot: () => void }) => {
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
            bgcolor: 'background.default', // Use background default instead of paper for a flatter look
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            {/* Logo Area */}
            <Box sx={{ p: 3, pt: 4, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <AutoAwesome sx={{ color: 'background.paper', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
                    RevOps
                </Typography>
            </Box>

            {/* Menu */}
            <List sx={{ px: 2 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: '9999px', // Pill shape for sidebar items
                                    py: 1,
                                    px: 2,
                                    bgcolor: active ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') : 'transparent',
                                    color: active ? 'text.primary' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                        color: 'text.primary'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                    {React.cloneElement(item.icon, { sx: { fontSize: 20 } } as any)}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 600 : 500, fontSize: '0.9rem' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}

                {/* AI Copilot Button */}
                <ListItem disablePadding sx={{ mt: 1 }}>
                    <ListItemButton
                        onClick={onOpenCopilot}
                        sx={{
                            borderRadius: '9999px',
                            py: 1.5,
                            px: 2,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: 'primary.main',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.2)',
                                color: 'primary.main'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                            <AutoAwesome sx={{ fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Ask AI" 
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} 
                        />
                    </ListItemButton>
                </ListItem>
            </List>

            <Box sx={{ mt: 'auto', p: 3, pb: 4 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '9999px',
                        color: 'text.secondary',
                        py: 1,
                        px: 2,
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: 'text.primary' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                        <Logout sx={{ fontSize: 20 }}/>
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
                </ListItemButton>
            </Box>
        </Box>
    );
};

export default Sidebar;
