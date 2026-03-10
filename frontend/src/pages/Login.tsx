import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Link, Stack } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/token', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            login(response.data.access_token);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.paper' }}>
            {/* Left Side - Form */}
            <Box sx={{
                flex: { xs: 1, md: 0.4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: { xs: 4, md: 8, lg: 12 },
                maxWidth: 600,
                mx: 'auto'
            }}>
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

                <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.03em', mb: 1, color: 'text.primary' }}>
                    Welcome back
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                    Enter your details to access your dashboard.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <Stack spacing={3}>
                        <TextField
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                        
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 3 }}>
                            Don't have an account?{' '}
                            <Link href="/register" underline="hover" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                Sign up
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Right Side - Image Graphic */}
            <Box sx={{
                flex: 0.6,
                display: { xs: 'none', md: 'block' },
                bgcolor: '#000000',
                p: 2,
            }}>
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 4,
                        backgroundImage: `url(/images/auth_hero.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}
                />
            </Box>
        </Box>
    );
};

export default Login;
