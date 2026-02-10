import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, CircularProgress } from '@mui/material';
import { fetchCohortAnalysis } from '../api';

const CohortAnalysis = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCohortAnalysis().then((res) => {
            setData(res);
            setLoading(false);
        });
    }, []);

    const getHeatmapColor = (value: number) => {
        // Red (0) -> Yellow (50) -> Green (100)
        // Simple distinct stops for clarity
        if (value >= 90) return '#4caf50'; // Green
        if (value >= 75) return '#8bc34a'; // Light Green
        if (value >= 50) return '#ffeb3b'; // Yellow
        if (value >= 25) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (!data || !data.retention || data.retention.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5">No enough data for cohort analysis.</Typography>
                <Typography color="text.secondary">Try uploading more sales data with a wider date range.</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Cohort Analysis</Typography>
                <Typography variant="body1" color="text.secondary">Customer Retention by Cohort (Month of First Purchase)</Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1, overflowX: 'auto' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Cohort</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
                            {data.heads.map((head: string) => (
                                <TableCell key={head} align="center" sx={{ fontWeight: 700 }}>
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.retention.map((row: any) => (
                            <TableRow key={row.cohort} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{row.cohort}</TableCell>
                                <TableCell>{row.size}</TableCell>
                                {data.heads.map((head: string) => {
                                    const val = row[head];
                                    const isZero = val === 0;
                                    return (
                                        <TableCell key={head} align="center" sx={{ p: 1 }}>
                                            {!isZero ? (
                                                <Box sx={{
                                                    bgcolor: getHeatmapColor(val),
                                                    color: val > 50 ? 'black' : 'white',
                                                    py: 1,
                                                    borderRadius: 1,
                                                    fontWeight: 600
                                                }}>
                                                    {val}%
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">-</Typography>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
};

export default CohortAnalysis;
