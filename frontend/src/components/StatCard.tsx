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
    color = 'text.primary',
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
                transition: 'all 0.2s ease-in-out',
                '&:hover': onClick ? {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                } : {}
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {title}
                    </Typography>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 20 } }) : icon}
                    </Box>
                </Stack>

                <Stack direction="row" alignItems="baseline" spacing={2}>
                    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
                        {value}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                    {trend ? (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(113, 113, 122, 0.1)',
                                color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : 'text.secondary',
                                px: 1,
                                py: 0.25,
                                borderRadius: '9999px',
                            }}>
                                {trend === 'up' && <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />}
                                {trend === 'down' && <TrendingDown sx={{ fontSize: 14, mr: 0.5 }} />}
                                {trend === 'neutral' && <Remove sx={{ fontSize: 14, mr: 0.5 }} />}
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {trendValue}
                                </Typography>
                            </Box>
                        </Stack>
                    ) : (
                        <Box /> // flex spacer layout
                    )}

                    {/* Sparkline (Mini Chart) */}
                    {sparklineData.length > 0 && (
                        <Box sx={{ width: 80, height: 32 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={color === 'text.primary' ? '#8B5CF6' : color}
                                        fill={color === 'text.primary' ? '#8B5CF6' : color}
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default StatCard;
