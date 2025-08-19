import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Chip, Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import AuthenService from "../../services/api/AuthenService";
import SellerService from "../../services/api/SellerService";
import { resetUserInfo } from "../../redux/slices/orebi.slice";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

// Import new icons from Tabler Icons
import {
  IconLayoutDashboard,
  IconHome,
  IconUsers,
  IconBuildingStore,
  IconBox,
  IconPackages,
  IconShoppingCart,
  IconTruckDelivery,
  IconArrowBackUp,
  IconMessageCircle,
  IconLogout,
  IconMenu2,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

const drawerWidth = 260;

// Custom theme with a modern, darker color palette
const theme = createTheme({
  palette: {
    primary: {
      main: "#0f52ba", // Deep blue
      light: "#1e63d6",
      dark: "#083a8f",
    },
    secondary: {
      main: "#2e7d32", // Dark green
      light: "#4caf50",
      dark: "#1b5e20",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
      drawer: "#1f2937", // Dark gray for the drawer
    },
    text: {
      primary: "#334155",
      secondary: "#64748b",
      drawer: "#e2e8f0", // Light text for dark drawer
    },
    divider: "#e2e8f0",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.palette.background.paper, // Changed to a clean white/light color
  color: theme.palette.text.primary,
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    backgroundColor: theme.palette.background.drawer,
    color: theme.palette.text.drawer,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
    "& .MuiListItemButton-root": {
      borderRadius: theme.shape.borderRadius,
      margin: "0 8px",
      marginBottom: "4px",
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.text.drawer,
      minWidth: 36,
    },
    "& .MuiListItemText-root": {
      fontSize: "0.9rem",
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: "4px 8px",
  transition: "all 0.2s ease",
  color: theme.palette.text.drawer,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
    },
    "& .MuiListItemIcon-root": {
      color: "white",
    },
    "& .MuiListItemText-primary": {
      fontWeight: 600,
      color: "white",
    },
  }),
}));

export default function ManagerDashboardSellerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dashboardTitle, setDashboardTitle] = React.useState("Dashboard");
  const [open, setOpen] = React.useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    SellerService.getStoreProfile()
      .then((res) => setStoreInfo(res.data))
      .catch(() => setStoreInfo(null));

    const path = window.location.pathname;
    setCurrentPath(path);
  }, []);

  const [openOrderMgmt, setOpenOrderMgmt] = React.useState(false);
  const handleToggleOrderMgmt = () => {
    setOpenOrderMgmt((prev) => !prev);
  };

  const handleSetDashboardTitle = (newDashboardTitle) => {
    setDashboardTitle(newDashboardTitle);
  };

  const isActive = (path) => {
    return currentPath.includes(path);
  };

  const handleOnclickOverview = () => {
    navigate("/overview");
    setCurrentPath("/overview");
    handleSetDashboardTitle("Dashboard");
  };

  const handleOnclickProducts = () => {
    navigate("/manage-product");
    setCurrentPath("/manage-product");
    handleSetDashboardTitle("Manage Products");
  };

  const handleOnclickStoreProfile = () => {
    navigate("/manage-store");
    setCurrentPath("/manage-store");
    handleSetDashboardTitle("Store Profile");
  };

  const handleOnclickInventory = () => {
    navigate("/manage-inventory");
    setCurrentPath("/manage-inventory");
    handleSetDashboardTitle("Inventory Management");
  };

  const handleOnclickOrder = () => {
    navigate("/manage-order");
    setCurrentPath("/manage-order");
    handleSetDashboardTitle("Manage Orders");
  };

  const handleOnclickDispute = () => {
    navigate("/manage-dispute");
    setCurrentPath("/manage-dispute");
    handleSetDashboardTitle("Disputes");
  };

  const handleOnclickReturnRequest = () => {
    navigate("/manage-return-request");
    setCurrentPath("/manage-return-request");
    handleSetDashboardTitle("Return Requests");
  };

  const handleOnclickShipping = () => {
    navigate("/manage-shipping");
    setCurrentPath("/manage-shipping");
    handleSetDashboardTitle("Shipping Management");
  };

  const handleOnclickHome = () => {
    navigate("/");
  };

  const handleOnclickSignout = async () => {
    try {
      await AuthenService.logout();
      dispatch(logout());
      dispatch(resetUserInfo());
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/signin");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px",
              "&.MuiToolbar-root": {
                height: 70,
              },
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
                color: theme.palette.text.primary,
              }}
            >
              <IconMenu2 />
            </IconButton>
            <Typography
              component="h1"
              variant="h5"
              color="inherit"
              noWrap
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {dashboardTitle}
            </Typography>
            {storeInfo ? (
              <Chip
                avatar={
                  <Avatar
                    src={storeInfo.sellerId.avatarURL}
                    alt={storeInfo.sellerId.fullname}
                    sx={{
                      width: 32,
                      height: 32,
                    }}
                  />
                }
                label={storeInfo.sellerId.fullname}
                sx={{
                  ml: 2,
                  fontWeight: 600,
                  fontSize: 14,
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  height: 38,
                }}
              />
            ) : (
              <Chip
                avatar={<Avatar />}
                label="Loading..."
                sx={{
                  ml: 2,
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                }}
              />
            )}
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
              height: 70,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {open && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    ml: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <IconBuildingStore
                    stroke={2}
                    size={30}
                    style={{ marginRight: 8, color: "white" }}
                  />
                  <Box sx={{ color: "white" }}>Seller Portal</Box>
                </Typography>
              </Box>
            )}
            <IconButton
              onClick={toggleDrawer}
              sx={{ color: theme.palette.text.drawer }}
            >
              <IconChevronLeft />
            </IconButton>
          </Toolbar>
          <Box
            sx={{
              height: "calc(100vh - 70px)",
              overflowY: "auto",
              py: 2,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#4a5568",
                borderRadius: "10px",
              },
            }}
          >
            <List component="nav">
              <StyledListItemButton
                onClick={handleOnclickOverview}
                selected={isActive("/overview")}
                sx={{ mb: 1 }}
              >
                <ListItemIcon>
                  <IconLayoutDashboard stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Dashboard" />}
              </StyledListItemButton>

              <StyledListItemButton onClick={handleOnclickHome} sx={{ mb: 1 }}>
                <ListItemIcon>
                  <IconHome stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Go to Shop" />}
              </StyledListItemButton>

              {open && (
                <Box sx={{ mx: 2, mt: 2, mb: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ pl: 1, color: theme.palette.text.secondary }}
                  >
                    STORE MANAGEMENT
                  </Typography>
                </Box>
              )}

              <StyledListItemButton
                onClick={handleOnclickStoreProfile}
                selected={isActive("/manage-store")}
              >
                <ListItemIcon>
                  <IconBuildingStore stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Store Profile" />}
              </StyledListItemButton>

              <StyledListItemButton
                onClick={handleOnclickProducts}
                selected={isActive("/manage-product")}
              >
                <ListItemIcon>
                  <IconBox stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Products" />}
              </StyledListItemButton>

              <StyledListItemButton
                onClick={handleOnclickInventory}
                selected={isActive("/manage-inventory")}
              >
                <ListItemIcon>
                  <IconPackages stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Inventory" />}
              </StyledListItemButton>

              {open && (
                <Box sx={{ mx: 2, mt: 2, mb: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ pl: 1, color: theme.palette.text.secondary }}
                  >
                    ORDERS & SHIPPING
                  </Typography>
                </Box>
              )}

              <StyledListItemButton
                onClick={handleOnclickOrder}
                selected={isActive("/manage-order")}
              >
                <ListItemIcon>
                  <IconShoppingCart stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Orders" />}
              </StyledListItemButton>

              <StyledListItemButton
                onClick={handleOnclickShipping}
                selected={isActive("/manage-shipping")}
              >
                <ListItemIcon>
                  <IconTruckDelivery stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Shipping" />}
              </StyledListItemButton>

              {open && (
                <Box sx={{ mx: 2, mt: 2, mb: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ pl: 1, color: theme.palette.text.secondary }}
                  >
                    CUSTOMER SERVICE
                  </Typography>
                </Box>
              )}

              <StyledListItemButton
                onClick={handleOnclickReturnRequest}
                selected={isActive("/manage-return-request")}
              >
                <ListItemIcon>
                  <IconArrowBackUp stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Return Requests" />}
              </StyledListItemButton>

              <StyledListItemButton
                onClick={handleOnclickDispute}
                selected={isActive("/manage-dispute")}
              >
                <ListItemIcon>
                  <IconMessageCircle stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Disputes" />}
              </StyledListItemButton>

              <Divider
                sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.1)" }}
              />

              <StyledListItemButton
                onClick={handleOnclickSignout}
                sx={{
                  color: theme.palette.error.main,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.error.main,
                  },
                  "& .MuiListItemText-primary": {
                    color: theme.palette.error.main,
                  },
                  "&:hover": {
                    bgcolor: "rgba(255, 0, 0, 0.1)",
                  },
                }}
              >
                <ListItemIcon>
                  <IconLogout stroke={1.5} />
                </ListItemIcon>
                {open && <ListItemText primary="Sign Out" />}
              </StyledListItemButton>
            </List>
          </Box>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: theme.palette.background.default,
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar sx={{ height: 70 }} />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                p: { xs: 2, md: 3 },
              }}
            >
              <Outlet context={{ handleSetDashboardTitle }} />
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
