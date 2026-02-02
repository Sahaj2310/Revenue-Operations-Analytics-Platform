import React, { useEffect, useState } from 'react';
import { Drawer, Box, Typography, Divider, List, ListItem, ListItemText, CircularProgress, Chip, Stack } from '@mui/material';
import { fetchCustomerDetails } from '../api';

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

    useEffect(() => {
        if (open && customerName) {
            setLoading(true);
            fetchCustomerDetails(customerName)
                .then(setTransactions)
                .catch((err: any) => console.error("Failed to load customer details", err))
                .finally(() => setLoading(false));
        } else {
            setTransactions([]);
        }
    }, [open, customerName]);

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 400, p: 3 }} role="presentation">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    {customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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
