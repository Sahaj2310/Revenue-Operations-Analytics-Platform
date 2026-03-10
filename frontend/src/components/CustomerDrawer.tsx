import React, { useEffect, useState } from 'react';
import { Drawer, Box, Typography, Divider, List, ListItem, ListItemText, CircularProgress, Chip, Stack, Button, Paper, IconButton, Tooltip } from '@mui/material';
import { fetchCustomerDetails, generateCustomerPitch } from '../api';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CustomerDrawerProps {
    open: boolean;
    onClose: () => void;
    customerName: string | null;
}

interface Transaction {
    id: number;
    date: string;
    amount: number;
    category: string;
}

const CustomerDrawer: React.FC<CustomerDrawerProps> = ({ open, onClose, customerName }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    
    // AI Pitch Generation State
    const [generatingPitch, setGeneratingPitch] = useState(false);
    const [pitch, setPitch] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (open && customerName) {
            setLoading(true);
            setPitch(null); // Reset pitch on new open
            setCopySuccess(false);
            fetchCustomerDetails(customerName)
                .then(setTransactions)
                .catch((err: any) => console.error("Failed to load customer details", err))
                .finally(() => setLoading(false));
        } else {
            setTransactions([]);
            setPitch(null);
        }
    }, [open, customerName]);

    const handleGeneratePitch = async () => {
        if (!customerName) return;
        setGeneratingPitch(true);
        setPitch(null);
        setCopySuccess(false);
        try {
            const response = await generateCustomerPitch(customerName);
            setPitch(response.pitch);
        } catch (error) {
            console.error("Failed to generate pitch", error);
            setPitch("Sorry, an error occurred while generating the pitch. Please try again.");
        } finally {
            setGeneratingPitch(false);
        }
    };

    const handleCopy = () => {
        if (pitch) {
            navigator.clipboard.writeText(pitch);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 450, p: 3 }} role="presentation">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    {customerName}
                </Typography>
                
                {/* AI Pitch Section */}
                <Box sx={{ mt: 3, mb: 4 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AutoAwesomeIcon fontSize="small" /> AI Messaging Assistant
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={handleGeneratePitch}
                            disabled={generatingPitch || loading}
                            sx={{ borderRadius: '20px', textTransform: 'none' }}
                        >
                            {generatingPitch ? 'Generating...' : 'Generate Outreach'}
                        </Button>
                    </Stack>
                    
                    {generatingPitch && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    
                    {pitch && (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', lineHeight: 1.6 }}>
                                {pitch}
                            </Typography>
                            <Tooltip title={copySuccess ? "Copied!" : "Copy to Clipboard"}>
                                <IconButton 
                                    size="small" 
                                    onClick={handleCopy} 
                                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', boxShadow: 1 }}
                                >
                                    <ContentCopyIcon fontSize="small" color={copySuccess ? "success" : "inherit"} />
                                </IconButton>
                            </Tooltip>
                        </Paper>
                    )}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 4 }}>
                    Transaction History
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {transactions.map((tx) => (
                            <ListItem key={tx.id} divider sx={{ px: 0 }}>
                                <ListItemText
                                    primary={
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                ${tx.amount.toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {tx.date}
                                            </Typography>
                                        </Stack>
                                    }
                                    secondary={
                                        <Chip
                                            label={tx.category}
                                            size="small"
                                            sx={{ mt: 1, bgcolor: 'action.selected', fontSize: '0.7rem' }}
                                        />
                                    }
                                />
                            </ListItem>
                        ))}
                        {transactions.length === 0 && (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                                No transactions found.
                            </Typography>
                        )}
                    </List>
                )}
            </Box>
        </Drawer>
    );
};

export default CustomerDrawer;
