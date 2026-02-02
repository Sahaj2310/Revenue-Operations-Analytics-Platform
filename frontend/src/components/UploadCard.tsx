import React, { useRef, useState } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress, Stack } from '@mui/material';
import { CloudUpload, InsertDriveFile, CheckCircle } from '@mui/icons-material';

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
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Data Ingestion
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload your CSV revenue data to update the dashboard.
                </Typography>

                <Box
                    sx={{
                        border: '2px dashed rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.04)',
                            borderColor: 'primary.main',
                        }
                    }}
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
                            <CircularProgress size={40} color="primary" />
                            <Typography variant="body2" color="text.secondary">Processing Data...</Typography>
                        </Stack>
                    ) : (
                        <Stack alignItems="center" spacing={2}>
                            <Box sx={{
                                p: 2,
                                borderRadius: '50%',
                                bgcolor: 'rgba(0, 229, 255, 0.1)',
                                color: 'primary.main'
                            }}>
                                <CloudUpload fontSize="large" />
                            </Box>
                            <Box>
                                <Button
                                    variant="contained"
                                    onClick={handleButtonClick}
                                    disabled={loading}
                                >
                                    Select CSV File
                                </Button>
                            </Box>
                            {fileName && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CheckCircle fontSize="small" color="success" />
                                    <Typography variant="caption" color="text.secondary">
                                        Last uploaded: {fileName}
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
