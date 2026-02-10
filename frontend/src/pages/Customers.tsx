import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Stack, TextField, InputAdornment, Tooltip } from '@mui/material';
import { fetchCustomers } from '../api';
import { Search } from '@mui/icons-material';
import CustomerDrawer from '../components/CustomerDrawer';

interface Customer {
    id: number;
    name: string;
    total_revenue: number;
    last_purchase: string;
    transactions: number;
    status: 'Active' | 'Inactive';
    churn_risk: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Unknown';
    churn_factors?: string[];
}

const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomers().then(setCustomers);
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High Risk': return 'error';
            case 'Medium Risk': return 'warning';
            case 'Low Risk': return 'success';
            default: return 'default';
        }
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Customer Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    AI-powered Churn Risk Analysis for {filteredCustomers.length} customers. Click a customer to view details.
                </Typography>
            </Box>

            <TextField
                fullWidth
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search color="action" />
                        </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.paper', borderRadius: 2 }
                }}
            />

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 1 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Churn Risk (AI)</TableCell>
                            <TableCell align="right">Total Revenue</TableCell>
                            <TableCell align="right">Transactions</TableCell>
                            <TableCell align="right">Last Active</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCustomers.slice(0, 50).map((customer) => (
                            <TableRow
                                key={customer.id}
                                hover
                                onClick={() => setSelectedCustomer(customer.name)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell sx={{ fontWeight: 500 }}>{customer.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={customer.status}
                                        size="small"
                                        variant="outlined"
                                        sx={{ color: 'text.secondary', borderColor: 'divider' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip
                                        title={
                                            customer.churn_factors && customer.churn_factors.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: 15 }}>
                                                    {customer.churn_factors.map((f, i) => <li key={i}>{f}</li>)}
                                                </ul>
                                            ) : "No data available"
                                        }
                                        arrow
                                        placement="top"
                                    >
                                        <Chip
                                            label={customer.churn_risk}
                                            size="small"
                                            color={getRiskColor(customer.churn_risk)}
                                            sx={{ fontWeight: 600, cursor: 'help' }}
                                        />
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="right">${customer.total_revenue.toLocaleString()}</TableCell>
                                <TableCell align="right">{customer.transactions}</TableCell>
                                <TableCell align="right">{customer.last_purchase}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CustomerDrawer
                open={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customerName={selectedCustomer}
            />
        </Stack>
    );
};

export default Customers;
