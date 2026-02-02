import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryData } from '../types';

interface CategoryChartProps {
    data: CategoryData[];
}

const COLORS = ['#00E5FF', '#8B5CF6', '#F59E0B', '#10B981'];

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
    return (
        <Card sx={{ height: '100%', minHeight: 350 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Revenue by Category</Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111827',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8
                                }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Effect */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -65%)', // Adjust for legend
                        textAlign: 'center',
                        pointerEvents: 'none'
                    }}>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                        <Typography variant="h6" color="text.primary">
                            ${data.reduce((acc, curr) => acc + curr.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CategoryChart;
