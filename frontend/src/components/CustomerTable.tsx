import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box } from '@mui/material';
import { Transaction } from '../types';
import { motion, Variants } from 'framer-motion';

interface CustomerTableProps {
    transactions: Transaction[];
}

const tableRowVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CustomerTable: React.FC<CustomerTableProps> = ({ transactions }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '0 !important' }}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Transactions</Typography>
                </Box>
                <TableContainer>
                    <Table size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider', pl: 3 }}>Customer</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>Service</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>Date</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider', pr: 3 }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((row, index) => (
                                <TableRow 
                                    component={motion.tr as any}
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.05 } as any}
                                    key={row.id} 
                                    hover
                                    sx={{ 
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'background-color 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ color: 'text.primary', fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider', pl: 3 }}>
                                        {row.customer}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Chip
                                            label={row.category}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(139, 92, 246, 0.1)', // Vibrant purple accent
                                                color: '#8B5CF6',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                height: 24,
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>
                                        {row.date}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600, borderBottom: '1px solid', borderColor: 'divider', pr: 3 }}>
                                        ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
