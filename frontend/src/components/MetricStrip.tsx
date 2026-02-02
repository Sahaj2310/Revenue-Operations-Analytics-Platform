import React from 'react';
import { Grid, Box } from '@mui/material';
import { AccountBalanceWallet, People, TrendingUp, AttachMoney } from '@mui/icons-material';
import StatCard from './StatCard';
import { AdvancedAnalyticsResponse } from '../types';
import { useNavigate } from 'react-router-dom';

interface MetricStripProps {
    data: AdvancedAnalyticsResponse | null;
}

const MetricStrip: React.FC<MetricStripProps> = ({ data }) => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Total Revenue (Period)"
                    value={data ? `$${data.mrr.toLocaleString()}` : '$0.00'}
                    icon={<AccountBalanceWallet />}
                    color="#00E5FF"
                    trend={data && data.growth_rate >= 0 ? "up" : "down"}
                    trendValue={data ? `${data.growth_rate}%` : ''}
                    sparklineData={data?.sparkline}
                    onClick={() => navigate('/analytics')}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Active Customers"
                    value={data ? data.active_customers : '0'}
                    icon={<People />}
                    color="#8B5CF6"
                    trend="neutral"
                    trendValue="Stable"
                    onClick={() => navigate('/customers')}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="ARPU"
                    value={data ? `$${data.arpu.toFixed(2)}` : '$0.00'}
                    icon={<AttachMoney />}
                    color="#F59E0B"
                    trend="up"
                    trendValue="+2.4%"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Growth Rate"
                    value={data ? `${data.growth_rate}%` : '0%'}
                    icon={<TrendingUp />}
                    color={data && data.growth_rate >= 0 ? "#10B981" : "#EF4444"}
                    trend={data && data.growth_rate >= 0 ? "up" : "down"}
                    trendValue="Month over Month"
                />
            </Grid>
        </Grid>
    );
};

export default MetricStrip;
