import React, { useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Stack } from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';

interface UploadCardProps {
    onUpload: (file: File) => Promise<void>;
}

const UploadCard: React.FC<UploadCardProps> = ({ onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setFileName(file.name);
            setLoading(true);
            try {
                await onUpload(file);
            } finally {
                setLoading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                    Data Ingestion
                </Typography>

                <Box
                    sx={{
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        }
                    }}
                    onClick={!loading ? handleButtonClick : undefined}
                >
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                    />

                    {loading ? (
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={32} color="primary" />
                            <Typography variant="body2" color="text.secondary">Processing Data...</Typography>
                        </Stack>
                    ) : (
                        <Stack alignItems="center" spacing={2}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                color: 'text.secondary'
                            }}>
                                <CloudUpload fontSize="small" />
                            </Box>
                            
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                                    Click to upload CSV
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Update your revenue metrics
                                </Typography>
                            </Box>

                            {fileName && (
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                                    <CheckCircle fontSize="small" color="success" />
                                    <Typography variant="caption" color="text.secondary">
                                        Last: {fileName}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default UploadCard;
