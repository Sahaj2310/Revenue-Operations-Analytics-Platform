import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Transaction } from '../types';

interface CustomerTableProps {
    transactions: Transaction[];
}

const CustomerTable: React.FC<CustomerTableProps> = ({ transactions }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Customer</TableCell>
                                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Service</TableCell>
                                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((row) => (
                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row" sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {row.customer}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            label={row.category}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(0, 229, 255, 0.1)',
                                                color: '#00E5FF',
                                                fontSize: '0.75rem',
                                                height: 24
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {row.date}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: '#F3F4F6', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        ${row.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default CustomerTable;
