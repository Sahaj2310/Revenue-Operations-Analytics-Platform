import React from 'react';
import { Grid } from '@mui/material';
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
            <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                    title="Total Revenue (Period)"
                    value={data ? `$${data.mrr.toLocaleString()}` : '$0.00'}
                    icon={<AccountBalanceWallet />}
                    color="text.primary"
                    trend={data && data.growth_rate >= 0 ? "up" : "down"}
                    trendValue={data ? `${Math.abs(data.growth_rate)}% vs last` : ''}
                    sparklineData={data?.sparkline}
                    onClick={() => navigate('/analytics')}
                />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                    title="Active Customers"
                    value={data ? data.active_customers.toLocaleString() : '0'}
                    icon={<People />}
                    trend={data && data.active_customers > 0 ? "up" : "neutral"}
                    trendValue={data && data.active_customers > 0 ? "Growing" : "Stable"}
                    onClick={() => navigate('/customers')}
                />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                    title="Average Revenue Per User"
                    value={data ? `$${data.arpu.toFixed(2)}` : '$0.00'}
                    icon={<AttachMoney />}
                    trend="up"
                    trendValue="+2.4% avg"
                />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                    title="Growth Rate"
                    value={data ? `${data.growth_rate}%` : '0%'}
                    icon={<TrendingUp />}
                    trend={data && data.growth_rate >= 0 ? "up" : "down"}
                    trendValue="MoM"
                />
            </Grid>
        </Grid>
    );
};

export default MetricStrip;
