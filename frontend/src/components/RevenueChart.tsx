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
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">Revenue Forecast</Typography>
                    <Typography variant="body2" color="text.secondary">
                        AI-powered prediction for the next quarter
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={combinedData}>
                            <defs>
                                <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111827',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8
                                }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />

                            <Area
                                type="monotone"
                                dataKey="history"
                                name="Historical Revenue"
                                stroke="#00E5FF"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorHistory)"
                                dot={{ fill: '#00E5FF', r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="prediction"
                                name="AI Forecast"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ fill: '#8B5CF6', r: 4 }}
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
