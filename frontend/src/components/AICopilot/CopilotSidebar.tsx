import React, { useState, useRef, useEffect } from 'react';
import { 
    Drawer, 
    Box, 
    Typography, 
    TextField, 
    IconButton, 
    Stack, 
    Paper, 
    CircularProgress, 
    Divider,
    Avatar
} from '@mui/material';
import { 
    Close, 
    Send, 
    SmartToy, 
    Person,
    AutoAwesome
} from '@mui/icons-material';
import { askAICopilot } from '../../api';
import CopilotResult from './CopilotResult';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    result?: {
        explanation: string;
        data: any[];
        visual_hint: string;
    };
    error?: string;
}

interface CopilotSidebarProps {
    open: boolean;
    onClose: () => void;
}

const CopilotSidebar: React.FC<CopilotSidebarProps> = ({ open, onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: 'Hello! I am your RevOps AI Copilot. Ask me anything about your revenue data, customers, or trends.' 
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (open) scrollToBottom();
    }, [messages, open]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userQuery = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
        setLoading(true);

        try {
            const result = await askAICopilot(userQuery);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: result.explanation, 
                result: {
                    explanation: result.explanation,
                    data: result.data,
                    visual_hint: result.visual_hint
                }
            }]);
        } catch (err: any) {
            console.error(err);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error while processing your request.',
                error: err.response?.data?.detail || 'API Error'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { 
                    width: { xs: '100%', sm: 450 },
                    bgcolor: 'background.default',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    backgroundImage: 'none'
                }
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <AutoAwesome sx={{ fontSize: 18, color: 'background.paper' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>AI Copilot</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Revenue Intelligence Assistant</Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {messages.map((msg, idx) => (
                    <Box key={idx} sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                        <Stack direction="row" spacing={1.5}>
                            {msg.role === 'assistant' && (
                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <SmartToy sx={{ fontSize: 16, color: 'primary.main' }} />
                                </Avatar>
                            )}
                            <Box sx={{ flex: 1 }}>
                                <Paper sx={{ 
                                    p: 2, 
                                    borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '2px 16px 16px 16px',
                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255,255,255,0.03)',
                                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: 'none'
                                }}>
                                    <Typography variant="body2">{msg.content}</Typography>
                                    
                                    {msg.result && msg.result.data.length > 0 && (
                                        <CopilotResult data={msg.result.data} visualHint={msg.result.visual_hint} />
                                    )}

                                    {msg.error && (
                                        <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
                                            {msg.error}
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>
                            {msg.role === 'user' && (
                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                </Avatar>
                            )}
                        </Stack>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ alignSelf: 'flex-start', ml: 5 }}>
                        <CircularProgress size={20} thickness={5} />
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Divider sx={{ opacity: 0.1 }} />
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <TextField
                    fullWidth
                    placeholder="Ask about revenue, churn, or trends..."
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading}
                    InputProps={{
                        endAdornment: (
                            <IconButton 
                                color="primary" 
                                onClick={handleSend} 
                                disabled={!input.trim() || loading}
                                size="small"
                            >
                                <Send fontSize="small" />
                            </IconButton>
                        ),
                        sx: {
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                        }
                    }}
                />
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.disabled' }}>
                    RevOps Copilot can make mistakes. Verify important results.
                </Typography>
            </Box>
        </Drawer>
    );
};

export default CopilotSidebar;
