import React, { useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, Button, Divider, Alert, Stack } from '@mui/material';
import { useColorMode } from '../context/ColorModeContext';
import { clearData } from '../api';
import { DeleteOutline, DarkMode } from '@mui/icons-material';

const Settings = () => {
    const { mode, toggleColorMode } = useColorMode();
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleClearData = async () => {
        if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
            try {
                await clearData();
                setMsg({ text: 'Data cleared successfully. Please upload a new CSV.', type: 'success' });
            } catch (error) {
                setMsg({ text: 'Failed to clear data.', type: 'error' });
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'text.primary' }}>
                Settings
            </Typography>
            
            <Stack spacing={4} sx={{ maxWidth: 600 }}>
                {/* Preferences */}
                <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 1 }}>
                    <Typography variant="h6" gutterBottom color="text.primary">Preferences</Typography>
                    
                     <FormControlLabel 
                        control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <DarkMode /> Dark Mode </Box>}
                        sx={{ color: 'text.secondary', display: 'block', mb: 2 }} 
                    />
                     
                     <FormControlLabel 
                        control={<Switch defaultChecked />} 
                        label="Enable AI Forecasting" 
                        sx={{ color: 'text.secondary', display: 'block' }} 
                    />
                </Box>

                {/* Danger Zone */}
                <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid #EF4444', position: 'relative', overflow: 'hidden' }}>
                     <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: '#EF4444' }} />
                     
                     <Typography variant="h6" gutterBottom color="text.primary">Danger Zone</Typography>
                     <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Permanently remove all sales data from the database.
                     </Typography>
                     
                     <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteOutline />}
                        onClick={handleClearData}
                    >
                        Clear All Data
                    </Button>

                    {msg && (
                        <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};

export default Settings;
