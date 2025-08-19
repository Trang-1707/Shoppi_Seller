import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Avatar, Chip, CircularProgress, Stack, Grid, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Divider, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MapIcon from '@mui/icons-material/Map';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import NotesIcon from '@mui/icons-material/Notes';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import HomeIcon from '@mui/icons-material/Home';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PublicIcon from '@mui/icons-material/Public';
import SellerService from '../../../services/api/SellerService';

// Styled Components
const InfoSectionCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    p: 3,
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    },
}));

const StyledIconButton = styled(Button)(({ theme }) => ({
    minWidth: 0,
    padding: theme.spacing(1),
    borderRadius: '50%',
    '& .MuiButton-startIcon': {
        margin: 0,
    },
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
    backgroundColor: '#F0F4F8',
    padding: theme.spacing(3),
}));

const DialogCard = styled(motion.div)(({ theme }) => ({
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: theme.spacing(2),
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
}));

// Motion Variants
const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1, ease: 'easeOut' } },
};

export default function StoreProfile() {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openEditStore, setOpenEditStore] = useState(false);
    const [openEditSeller, setOpenEditSeller] = useState(false);
    const [formStore, setFormStore] = useState({ storeName: "", description: "", bannerImageURL: "" });
    const [formSeller, setFormSeller] = useState({ username: "", fullname: "", email: "", avatar: "", phone: "", street: "", city: "", state: "", country: "" });
    const [savingStore, setSavingStore] = useState(false);
    const [savingSeller, setSavingSeller] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await SellerService.getStoreProfile();
            setStore(res.data);
            setFormStore({ ...res.data });
            setFormSeller({ ...res.data.sellerId, ...res.data.address });
        } catch (err) {
            setStore(null);
        } finally {
            setLoading(false);
        }
    };

    // Store logic
    const handleOpenEditStore = () => setOpenEditStore(true);
    const handleCloseEditStore = () => setOpenEditStore(false);
    const handleChangeStore = (e) => setFormStore(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSaveStore = async () => {
        setSavingStore(true);
        try {
            await SellerService.updateStoreProfile(formStore);
            await fetchProfile();
            setOpenEditStore(false);
        } finally {
            setSavingStore(false);
        }
    };

    // Seller logic
    const seller = store?.sellerId || {};
    const address = store?.address || {};
    const handleOpenEditSeller = () => setOpenEditSeller(true);
    const handleCloseEditSeller = () => setOpenEditSeller(false);
    const handleChangeSeller = (e) => setFormSeller(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSaveSeller = async () => {
        setSavingSeller(true);
        try {
            await SellerService.updateSellerProfile(formSeller);
            await fetchProfile();
            setOpenEditSeller(false);
        } finally {
            setSavingSeller(false);
        }
    };

    if (loading) return <CircularProgress sx={{ m: 3 }} />;
    if (!store) return <Typography color="text.secondary">You have no store yet.</Typography>;

    return (
        <Grid container spacing={4}>
            {/* Store Profile Card */}
            <Grid item xs={12} md={6}>
                <InfoSectionCard>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <StorefrontIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                                <Typography variant="h5" fontWeight={600}>Store Profile</Typography>
                            </Stack>
                            <StyledIconButton variant="outlined" startIcon={<EditIcon />} onClick={handleOpenEditStore}>
                                Edit
                            </StyledIconButton>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Avatar variant="rounded" src={store.bannerImageURL} sx={{ width: 100, height: 100, borderRadius: 2 }} />
                            <Box>
                                <Typography variant="h6" fontWeight={700}>{store.storeName}</Typography>
                                <Typography variant="body2" color="text.secondary">{store.description || 'Ebay Department'}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <Chip
                                        size="small"
                                        label={store.status}
                                        color={store.status === 'approved' ? 'success' : 'info'}
                                        sx={{ bgcolor: store.status === 'pending' ? 'info.light' : null, color: store.status === 'pending' ? 'info.dark' : null }}
                                    />
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <StarIcon sx={{ color: '#FFD600', fontSize: 18 }} />
                                        <Typography variant="body2">{store.avgRating || 0}/5</Typography>
                                        <Typography variant="body2" color="text.secondary">({store.totalReviews || 0} reviews)</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </InfoSectionCard>
            </Grid>

            {/* Seller Profile Card */}
            <Grid item xs={12} md={6}>
                <InfoSectionCard>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <PersonIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                                <Typography variant="h5" fontWeight={600}>Seller Profile</Typography>
                            </Stack>
                            <StyledIconButton variant="outlined" startIcon={<EditIcon />} onClick={handleOpenEditSeller}>
                                Edit
                            </StyledIconButton>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Avatar src={seller.avatarURL} sx={{ width: 100, height: 100, borderRadius: '50%' }} />
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" fontWeight={700}>{seller.fullname || '--'}</Typography>
                                    <Typography variant="body2" color="text.secondary">@{seller.username || '--'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack spacing={1}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2">{seller.email || '--'}</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2">{address.phone || '--'}</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <MapIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2">{address.street ? `${address.street}, ${address.city}` : '--'}</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2">Password: •••••••</Typography>
                                        </Stack>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Stack>
                    </CardContent>
                </InfoSectionCard>
            </Grid>
            
            {/* Edit Store Dialog with new card design */}
            <AnimatePresence>
                {openEditStore && (
                    <motion.div initial="hidden" animate="visible" exit="exit" variants={dialogVariants}>
                        <Dialog open={openEditStore} onClose={handleCloseEditStore} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                                <StorefrontIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>Update Store Profile</Typography>
                            </DialogTitle>
                            <DialogContentStyled dividers>
                                <Stack spacing={3}>
                                    <DialogCard variants={cardVariants}>
                                        <Typography variant="subtitle1" fontWeight={600} mb={2}>Basic Information</Typography>
                                        <Stack spacing={2}>
                                            <TextField 
                                                label="Store Name" 
                                                name="storeName" 
                                                value={formStore.storeName} 
                                                onChange={handleChangeStore} 
                                                fullWidth 
                                                variant="outlined" 
                                                InputProps={{ startAdornment: <StorefrontIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                            />
                                            <TextField 
                                                label="Description" 
                                                name="description" 
                                                value={formStore.description} 
                                                onChange={handleChangeStore} 
                                                multiline 
                                                minRows={2} 
                                                fullWidth 
                                                variant="outlined" 
                                                InputProps={{ startAdornment: <NotesIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                                            />
                                        </Stack>
                                    </DialogCard>
                                    <DialogCard variants={cardVariants}>
                                        <Typography variant="subtitle1" fontWeight={600} mb={2}>Branding</Typography>
                                        <TextField 
                                            label="Banner Image URL" 
                                            name="bannerImageURL" 
                                            value={formStore.bannerImageURL} 
                                            onChange={handleChangeStore} 
                                            fullWidth 
                                            variant="outlined" 
                                            InputProps={{ startAdornment: <ImageSearchIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                                        />
                                    </DialogCard>
                                </Stack>
                            </DialogContentStyled>
                            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Button onClick={handleCloseEditStore} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
                                <Button onClick={handleSaveStore} disabled={savingStore} variant="contained" sx={{ textTransform: 'none' }}>
                                    {savingStore ? "Saving..." : "Save"}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Seller Dialog with new card design */}
            <AnimatePresence>
                {openEditSeller && (
                    <motion.div initial="hidden" animate="visible" exit="exit" variants={dialogVariants}>
                        <Dialog open={openEditSeller} onClose={handleCloseEditSeller} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                                <PersonIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>Update Seller Profile</Typography>
                            </DialogTitle>
                            <DialogContentStyled dividers>
                                <Stack spacing={3}>
                                    <DialogCard variants={cardVariants}>
                                        <Typography variant="subtitle1" fontWeight={600} mb={2}>Personal Information</Typography>
                                        <Stack spacing={2}>
                                            <TextField 
                                                label="Username" 
                                                name="username" 
                                                value={formSeller.username} 
                                                onChange={handleChangeSeller} 
                                                fullWidth 
                                                variant="outlined" 
                                                InputProps={{ startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                            />
                                            <TextField 
                                                label="Full Name" 
                                                name="fullname" 
                                                value={formSeller.fullname} 
                                                onChange={handleChangeSeller} 
                                                fullWidth 
                                                variant="outlined" 
                                                InputProps={{ startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                            />
                                            <TextField 
                                                label="Email" 
                                                name="email" 
                                                value={formSeller.email} 
                                                onChange={handleChangeSeller} 
                                                type="email" 
                                                fullWidth 
                                                variant="outlined" 
                                                InputProps={{ startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                            />
                                            <TextField 
                                                label="Avatar URL" 
                                                name="avatar" 
                                                value={formSeller.avatar} 
                                                onChange={handleChangeSeller} 
                                                fullWidth 
                                                variant="outlined" 
                                                InputProps={{ startAdornment: <ImageSearchIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                                            />
                                        </Stack>
                                    </DialogCard>
                                    <DialogCard variants={cardVariants}>
                                        <Typography variant="subtitle1" fontWeight={600} mb={2}>Contact & Address</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField 
                                                    label="Phone" 
                                                    name="phone" 
                                                    value={formSeller.phone} 
                                                    onChange={handleChangeSeller} 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ startAdornment: <PhoneIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField 
                                                    label="Street" 
                                                    name="street" 
                                                    value={formSeller.street} 
                                                    onChange={handleChangeSeller} 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ startAdornment: <HomeIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField 
                                                    label="City" 
                                                    name="city" 
                                                    value={formSeller.city} 
                                                    onChange={handleChangeSeller} 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ startAdornment: <LocationCityIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField 
                                                    label="State" 
                                                    name="state" 
                                                    value={formSeller.state} 
                                                    onChange={handleChangeSeller} 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ startAdornment: <MapIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField 
                                                    label="Country" 
                                                    name="country" 
                                                    value={formSeller.country} 
                                                    onChange={handleChangeSeller} 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ startAdornment: <PublicIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </DialogCard>
                                </Stack>
                            </DialogContentStyled>
                            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Button onClick={handleCloseEditSeller} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
                                <Button onClick={handleSaveSeller} disabled={savingSeller} variant="contained" sx={{ textTransform: 'none' }}>
                                    {savingSeller ? "Saving..." : "Save changes"}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </motion.div>
                )}
            </AnimatePresence>
        </Grid>
    );
}