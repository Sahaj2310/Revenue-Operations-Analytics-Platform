import React from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Card,
    useTheme
} from '@mui/material';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

interface CopilotResultProps {
    data: any[];
    visualHint: string;
}

const CopilotResult: React.FC<CopilotResultProps> = ({ data, visualHint }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>No data found for this query.</Typography>;
    }

    const columns = Object.keys(data[0]);

    // Handle KPI (Single value)
    if (visualHint === 'kpi' && data.length === 1 && columns.length === 1) {
        const value = data[0][columns[0]];
        return (
            <Card sx={{ p: 3, mt: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>{columns[0].replace('_', ' ').toUpperCase()}</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {typeof value === 'number' ? 
                        (columns[0].toLowerCase().includes('revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()) 
                        : value}
                </Typography>
            </Card>
        );
    }

    // Handle Charts
    if (visualHint === 'bar_chart' || visualHint === 'line_chart') {
        const xKey = columns[0];
        const yKey = columns[1] || columns[0];

        return (
            <Box sx={{ width: '100%', height: 250, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {visualHint === 'bar_chart' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} fontSize={10} />
                            <YAxis stroke={theme.palette.text.secondary} fontSize={10} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: 8 }}
                                itemStyle={{ color: theme.palette.primary.main }}
                            />
                            <Bar dataKey={yKey} fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} fontSize={10} />
                            <YAxis stroke={theme.palette.text.secondary} fontSize={10} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: 8 }}
                                itemStyle={{ color: theme.palette.primary.main }}
                            />
                            <Line type="monotone" dataKey={yKey} stroke={theme.palette.primary.main} strokeWidth={2} dot={{ fill: theme.palette.primary.main }} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </Box>
        );
    }

    // Default: Table
    return (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300, bgcolor: 'rgba(0,0,0,0.2)', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col} sx={{ bgcolor: '#121212', fontWeight: 600, color: 'text.secondary' }}>
                                {col.replace('_', ' ').toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, i) => (
                        <TableRow key={i}>
                            {columns.map((col) => (
                                <TableCell key={col} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CopilotResult;
