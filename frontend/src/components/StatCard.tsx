import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { SparklinePoint } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
    sparklineData?: SparklinePoint[];
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    color = '#00E5FF',
    sparklineData = [],
    onClick
}) => {
    return (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': onClick ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                } : {}
            }}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: `${color}15`, // 15% opacity
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    {/* Sparkline (Mini Chart) */}
                    {sparklineData.length > 0 && (
                        <Box sx={{ width: 80, height: 40 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={color}
                                        fill={color}
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </Stack>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {value}
                </Typography>

                {trend && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        {trend === 'up' && <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />}
                        {trend === 'down' && <TrendingDown sx={{ fontSize: 16, color: '#EF4444' }} />}
                        {trend === 'neutral' && <Remove sx={{ fontSize: 16, color: 'text.secondary' }} />}

                        <Typography
                            variant="caption"
                            sx={{
                                color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : 'text.secondary',
                                fontWeight: 600
                            }}
                        >
                            {trendValue}
                        </Typography>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
