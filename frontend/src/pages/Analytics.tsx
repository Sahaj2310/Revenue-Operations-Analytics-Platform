import { useEffect, useState } from 'react';
import { Grid, Stack, Typography, CircularProgress, Box, FormControl, Select, MenuItem, SelectChangeEvent, useTheme } from '@mui/material';
import CategoryChart from '../components/CategoryChart';
import CustomerTable from '../components/CustomerTable';
import { fetchAdvancedAnalytics, fetchCustomers } from '../api';
import { AdvancedAnalyticsResponse } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';

interface Customer {
    id: number;
    name: string;
    total_revenue: number;
    last_purchase: string;
    recency?: number;
    churn_risk: string;
}

const Analytics = () => {
    const [advanced, setAdvanced] = useState<AdvancedAnalyticsResponse | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('90d');
    const theme = useTheme();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [advData, custData] = await Promise.all([
                    fetchAdvancedAnalytics(timeRange),
                    fetchCustomers()
                ]);
                setAdvanced(advData);
                setCustomers(custData);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [timeRange]);

    const handleRangeChange = (event: SelectChangeEvent) => {
        setTimeRange(event.target.value as string);
    };

    const handleExport = () => {
        if (!advanced) return;

        // Convert category data to CSV
        const headers = "Category,Revenue\n";
        const rows = advanced.category_split.map(c => `${c.name},${c.value}`).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "revenue_category_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Prepare Data for Scatter Plot
    const scatterData = customers.map(c => ({
        x: c.recency || 0,
        y: c.total_revenue,
        z: 100, // Bubble size
        name: c.name,
        risk: c.churn_risk
    }));

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High Risk': return theme.palette.error.main;
            case 'Medium Risk': return theme.palette.warning.main;
            case 'Low Risk': return theme.palette.success.main;
            default: return theme.palette.text.secondary;
        }
    };

    if (loading && !advanced) return <CircularProgress />;

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                {/* ... Header ... */}
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Deep Dive Analytics
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Analyze revenue sources, churn risk, and transaction history.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Box
                        component="button"
                        onClick={handleExport}
                        sx={{
                            border: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            }
                        }}
                    >
                        Export CSV
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={timeRange}
                            onChange={handleRangeChange}
                            sx={{ bgcolor: 'background.paper' }}
                        >
                            <MenuItem value="7d">Last 7 Days</MenuItem>
                            <MenuItem value="30d">Last 30 Days</MenuItem>
                            <MenuItem value="90d">Last Quarter</MenuItem>
                            <MenuItem value="12m">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <CategoryChart data={advanced?.category_split || []} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        height: 400,
                        bgcolor: 'background.paper',
                        borderRadius: 4,
                        p: 3,
                        boxShadow: 1
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Churn Risk Analysis
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis type="number" dataKey="x" name="Recency (Days)">
                                    <Label value="Days Since Last Purchase" offset={-10} position="insideBottom" />
                                </XAxis>
                                <YAxis type="number" dataKey="y" name="Revenue">
                                    <Label value="Total Revenue ($)" angle={-90} position="insideLeft" />
                                </YAxis>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                                                <Typography variant="subtitle2">{data.name}</Typography>
                                                <Typography variant="caption" display="block">Revenue: ${data.y.toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">Inactive: {data.x} days</Typography>
                                                <Typography variant="caption" color={getRiskColor(data.risk)} sx={{ fontWeight: 'bold' }}>
                                                    {data.risk}
                                                </Typography>
                                            </Box>
                                        );
                                    }
                                    return null;
                                }} />
                                <Scatter name="Customers" data={scatterData} fill="#8884d8">
                                    {scatterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Box>
                </Grid>
            </Grid>

            {/* Detailed Transaction Log */}
            <CustomerTable transactions={advanced?.recent_transactions || []} />
        </Stack>
    );
};

export default Analytics;
