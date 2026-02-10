import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Stack, Card, CardContent, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Add, Delete, NotificationsActive, Warning, Info, CheckCircle } from '@mui/icons-material';
import { fetchAlertRules, createAlertRule, deleteAlertRule, fetchAlertEvents } from '../api';

const Alerts = () => {
    const [rules, setRules] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', metric: 'mrr', condition: '<', threshold: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [r, e] = await Promise.all([fetchAlertRules(), fetchAlertEvents()]);
        setRules(r);
        setEvents(e);
    };

    const handleCreate = async () => {
        await createAlertRule(newRule);
        setOpen(false);
        loadData();
    };

    const handleDelete = async (id: number) => {
        await deleteAlertRule(id);
        loadData();
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'warning': return <Warning color="warning" />;
            case 'critical': return <Warning color="error" />;
            default: return <Info color="info" />;
        }
    };

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Alerts & Notifications</Typography>
                    <Typography variant="body1" color="text.secondary">Monitor key metrics and get notified of critical changes.</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                    New Alert Rule
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
                {/* Rules Section */}
                <Card sx={{ borderRadius: 3, height: 'fit-content' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Active Rules</Typography>
                        <Stack spacing={2}>
                            {rules.map(rule => (
                                <Paper key={rule.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>{rule.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {rule.metric.toUpperCase()} {rule.condition} {rule.threshold}
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Paper>
                            ))}
                            {rules.length === 0 && <Typography variant="body2" color="text.secondary">No active rules.</Typography>}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Events Section */}
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Notifications</Typography>
                        <List>
                            {events.map((event) => (
                                <ListItem key={event.id} sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <ListItemIcon>
                                        {getSeverityIcon(event.severity)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={event.message}
                                        secondary={new Date(event.timestamp).toLocaleString()}
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                    />
                                </ListItem>
                            ))}
                            {events.length === 0 && <Typography variant="body2" color="text.secondary">No recent notifications.</Typography>}
                        </List>
                    </CardContent>
                </Card>
            </Box>

            {/* Create Rule Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Alert Rule</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Rule Name"
                            fullWidth
                            value={newRule.name}
                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Metric</InputLabel>
                            <Select
                                value={newRule.metric}
                                label="Metric"
                                onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                            >
                                <MenuItem value="mrr">Monthly Recurring Revenue (MRR)</MenuItem>
                                <MenuItem value="active_customers">Active Customers</MenuItem>
                                <MenuItem value="churn_risk">High Risk Customer Count</MenuItem>
                            </Select>
                        </FormControl>
                        <Stack direction="row" spacing={2}>
                            <FormControl sx={{ minWidth: 100 }}>
                                <InputLabel>Condition</InputLabel>
                                <Select
                                    value={newRule.condition}
                                    label="Condition"
                                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                                >
                                    <MenuItem value=">">Greater Than</MenuItem>
                                    <MenuItem value="<">Less Than</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Threshold"
                                type="number"
                                fullWidth
                                value={newRule.threshold}
                                onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create Rule</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default Alerts;
