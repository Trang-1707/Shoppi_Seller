import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import StoreProfile from './StoreProfile';

export default function ManageStoreProfile() {
    const { handleSetDashboardTitle } = useOutletContext();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        handleSetDashboardTitle("Manage Store Profile");
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [handleSetDashboardTitle]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Update your store's information, contact details, and branding.
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container>
                    <Grid item xs={12}>
                        <StoreProfile />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}