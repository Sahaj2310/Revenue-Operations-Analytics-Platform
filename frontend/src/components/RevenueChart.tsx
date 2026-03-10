import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { MonthlyRevenue } from '../types';

interface RevenueChartProps {
    history: MonthlyRevenue[];
    prediction: MonthlyRevenue[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ history, prediction }) => {
    const theme = useTheme();

    // Prepare data: Join history and prediction
    // History data has 'revenue', prediction has 'predictedRevenue' logic
    // But for a continuous chart, we often want them aligned.

    // Strategy: 
    // 1. Map history to have { month, history: value }
    // 2. Map prediction to have { month, prediction: value }
    // 3. Combine. The last history point should connect to first prediction if continuous, 
    //    but here we'll keep them distinct layers for visual clarity.

    const combinedData = [
        ...(Array.isArray(history) ? history : []).map(d => ({ month: d.month, history: d.revenue, prediction: null })),
        ...(Array.isArray(prediction) ? prediction : []).map(d => ({ month: d.month, history: null, prediction: d.revenue }))
    ];

    return (
        <Card sx={{ height: '100%', minHeight: 400 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                        Revenue Forecast
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
                        AI-Powered Projection
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={combinedData}>
                            <defs>
                                <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.mode === 'dark' ? '#FFFFFF' : '#09090B'} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={theme.palette.mode === 'dark' ? '#FFFFFF' : '#09090B'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke={theme.palette.text.secondary}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke={theme.palette.text.secondary}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 12,
                                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: theme.palette.text.primary, fontWeight: 500 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />

                            <Area
                                type="monotone"
                                dataKey="history"
                                name="Historical Revenue"
                                stroke={theme.palette.mode === 'dark' ? '#FFFFFF' : '#09090B'}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorHistory)"
                                dot={{ fill: theme.palette.mode === 'dark' ? '#FFFFFF' : '#09090B', r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="prediction"
                                name="AI Forecast"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }}
                                connectNulls
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RevenueChart;
