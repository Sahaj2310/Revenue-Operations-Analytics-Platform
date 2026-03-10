import { useEffect, useState } from 'react';
import { Grid, Stack, Typography, CircularProgress, Box, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import MetricStrip from '../components/MetricStrip';
import RevenueChart from '../components/RevenueChart';
import UploadCard from '../components/UploadCard';
import { fetchStats, getForecast, fetchAdvancedAnalytics, uploadFile } from '../api';
import { StatsResponse, MonthlyRevenue, AdvancedAnalyticsResponse } from '../types';
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

const Dashboard = () => {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [forecast, setForecast] = useState<MonthlyRevenue[]>([]);
    const [advanced, setAdvanced] = useState<AdvancedAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    const loadData = async (range: string) => {
        try {
            // We can optimize this to not re-fetch stats/forecast every time if not needed, 
            // but for now we reload everything to ensure consistency.
            const statsData = await fetchStats();
            const forecastData = await getForecast();
            const advancedData = await fetchAdvancedAnalytics(range);

            setStats(statsData);
            setForecast(forecastData.forecast);
            setAdvanced(advancedData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(timeRange);
    }, [timeRange]);

    const handleRangeChange = (event: SelectChangeEvent) => {
        setTimeRange(event.target.value as string);
    };

    const handleUpload = async (file: File) => {
        setLoading(true); // Show local loading state
        try {
            await uploadFile(file);
            await loadData(timeRange);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) { // Only showing full loading on first load
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Stack component={motion.div} variants={containerVariants} initial="hidden" animate="visible" spacing={3}>
            {/* Header with Filter */}
            <motion.div variants={itemVariants}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary', mb: 0.5 }}>
                            Overview
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Real-time revenue intelligence
                        </Typography>
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
            </motion.div>

            <motion.div variants={itemVariants}>
                <MetricStrip data={advanced} />
            </motion.div>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8} component={motion.div} variants={itemVariants}>
                    <RevenueChart
                        history={stats?.monthly_revenue || []}
                        prediction={forecast}
                    />
                </Grid>
                <Grid item xs={12} lg={4} component={motion.div} variants={itemVariants}>
                    <UploadCard onUpload={handleUpload} />
                </Grid>
            </Grid>
        </Stack>
    );
};

export default Dashboard;
