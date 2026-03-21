import { useEffect, useState } from 'react';
import { Grid, Stack, Typography, CircularProgress, Box, FormControl, Select, MenuItem, SelectChangeEvent, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Checkbox, TextField } from '@mui/material';
import CategoryChart from '../components/CategoryChart';
import CustomerTable from '../components/CustomerTable';
import { fetchAdvancedAnalytics, fetchCustomers, downloadExecutiveReport } from '../api';
import { AdvancedAnalyticsResponse } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

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
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [timeRange, setTimeRange] = useState('90d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [includeHighRisk, setIncludeHighRisk] = useState(false);
    const [includeMediumRisk, setIncludeMediumRisk] = useState(false);
    const [includeLowRisk, setIncludeLowRisk] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const load = async () => {
            if (timeRange === 'custom' && (!customStart || !customEnd)) {
                return;
            }
            setLoading(true);
            try {
                // Parallel fetch
                const [advData, custData] = await Promise.all([
                    fetchAdvancedAnalytics(
                        timeRange, 
                        timeRange === 'custom' ? customStart : undefined, 
                        timeRange === 'custom' ? customEnd : undefined
                    ),
                    fetchCustomers()
                ]);
                setAdvanced(advData);
                setCustomers(custData);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [timeRange, customStart, customEnd]);

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

    const handleDownloadPdf = async () => {
        setReportDialogOpen(false);
        setDownloadingPdf(true);
        try {
            const riskLevels: string[] = [];
            if (includeHighRisk) riskLevels.push('High Risk');
            if (includeMediumRisk) riskLevels.push('Medium Risk');
            if (includeLowRisk) riskLevels.push('Low Risk');

            const blob = await downloadExecutiveReport(
                timeRange, 
                riskLevels,
                timeRange === 'custom' ? customStart : undefined,
                timeRange === 'custom' ? customEnd : undefined
            );
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Executive_Revenue_Report_${timeRange}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download PDF report:", error);
            alert("Failed to generate the PDF report. Please try again.");
        } finally {
            setDownloadingPdf(false);
        }
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
        <Stack component={motion.div} variants={containerVariants} initial="hidden" animate="visible" spacing={3}>
            <motion.div variants={itemVariants}>
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

                    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setReportDialogOpen(true)}
                            disabled={downloadingPdf}
                            sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                            {downloadingPdf ? 'Generating PDF...' : 'Download Report (.pdf)'}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleExport}
                            sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                            Export CSV
                        </Button>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={timeRange}
                                onChange={handleRangeChange}
                                sx={{ bgcolor: 'background.paper' }}
                            >
                                <MenuItem value="7d">7 days</MenuItem>
                                <MenuItem value="30d">Month</MenuItem>
                                <MenuItem value="90d">Quarter</MenuItem>
                                <MenuItem value="12m">Year</MenuItem>
                                <MenuItem value="ytd">YTD</MenuItem>
                                <MenuItem value="custom">Custom Dates</MenuItem>
                            </Select>
                        </FormControl>
                        {timeRange === 'custom' && (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <TextField
                                    size="small"
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    sx={{ 
                                        bgcolor: 'background.paper', 
                                        width: 140,
                                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                            filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none'
                                        }
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">to</Typography>
                                <TextField
                                    size="small"
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    sx={{ 
                                        bgcolor: 'background.paper', 
                                        width: 140,
                                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                            filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none'
                                        }
                                    }}
                                />
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </motion.div>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
                    <CategoryChart data={advanced?.category_split || []} />
                </Grid>
                <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
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
            <motion.div variants={itemVariants}>
                <CustomerTable transactions={advanced?.recent_transactions || []} />
            </motion.div>

            {/* Report Options Dialog */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
                <DialogTitle>Report Options</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom sx={{ mb: 2 }}>Select any customer risk categories to include in the generated report:</Typography>
                    <Stack spacing={1}>
                        <FormControlLabel
                            control={<Checkbox checked={includeHighRisk} onChange={(e) => setIncludeHighRisk(e.target.checked)} />}
                            label="Include High Risk Customers"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={includeMediumRisk} onChange={(e) => setIncludeMediumRisk(e.target.checked)} />}
                            label="Include Medium Risk Customers"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={includeLowRisk} onChange={(e) => setIncludeLowRisk(e.target.checked)} />}
                            label="Include Low Risk Customers"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDownloadPdf} variant="contained" disabled={downloadingPdf}>
                        {downloadingPdf ? 'Generating...' : 'Generate & Download'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default Analytics;
