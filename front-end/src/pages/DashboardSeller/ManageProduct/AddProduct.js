import * as React from "react";
import {
  Autocomplete,
  TextField,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  MenuItem,
  Fab,
  Tooltip,
  Zoom,
  InputAdornment,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import GavelIcon from "@mui/icons-material/Gavel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../services/index";
// import ReCAPTCHA from 'react-google-recaptcha';

// Styled Components
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  backgroundColor: "#F0F4F8",
  padding: theme.spacing(3),
}));

const DialogCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: theme.spacing(3),
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  border: "1px solid #e0e0e0",
}));

// Motion Variants
const dialogVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1, ease: "easeOut" },
  },
};

export default function AddProduct({ onAdded }) {
  const [openAddProductDialog, setOpenAddProductDialog] = React.useState(false);
  const [openAddCategoryDialog, setOpenAddCategoryDialog] =
    React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [isAuction, setIsAuction] = React.useState("false");
  const [quantity, setQuantity] = React.useState(0);
  const [image, setImage] = React.useState("");
  const [popup, setPopup] = React.useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const [categories, setCategories] = React.useState([]);

  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryDescription, setNewCategoryDescription] =
    React.useState("");
  // const [recaptchaOk, setRecaptchaOk] = React.useState(false);
  // const [recaptchaToken, setRecaptchaToken] = React.useState('');

  React.useEffect(() => {
    api
      .get("seller/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories([]);
      });
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // if (!recaptchaOk || !recaptchaToken) {
    //     setSnackbar({ open: true, msg: 'Please complete captcha', severity: 'error' });
    //     return;
    // }

    const requestBody = {
      title,
      description,
      price: Number(price),
      image,
      categoryId,
      isAuction: isAuction === "true",
      quantity: Number(quantity),
      // recaptchaToken,
    };
    console.log("image", image);

    try {
      const result = await api.post("seller/products", requestBody);

      if (result.data?.success) {
        setPopup({
          open: true,
          msg: "Product added successfully!",
          severity: "success",
        });
        setOpenAddProductDialog(false);
        setTitle("");
        setDescription("");
        setCategoryId("");
        setPrice(0);
        setIsAuction("false");
        setQuantity(0);
        setImage("");
        onAdded();
      } else {
        let msg = result.data.message;
        if (msg && msg.includes('tối đa 10 sản phẩm')) {
          msg = 'Bạn là seller mới, chỉ được đăng tối đa 10 sản phẩm trong 1 tháng đầu tiên!';
        }
        setPopup({
          open: true,
          msg,
          severity: "error",
        });
        setOpenAddProductDialog(false);
      }
    } catch (error) {
      // Nếu có message từ API (ví dụ lỗi 403 vượt quá 10 sản phẩm)
      let apiMsg = error?.response?.data?.message;
      if (apiMsg && apiMsg.includes('tối đa 10 sản phẩm')) {
        apiMsg = 'Bạn là seller mới, chỉ được đăng tối đa 10 sản phẩm trong 1 tháng đầu tiên!';
      }
      setPopup({
        open: true,
        msg: apiMsg || "Error occurred while adding the product.",
        severity: "error",
      });
      setOpenAddProductDialog(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const uploadedUrl = res.data.data.url; // MinIO public URL
        setImage(uploadedUrl);
        console.log("Image uploaded:", uploadedUrl);
      } else {
        console.error("Upload failed:", res.data.message);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  const handleAddCategoryClick = () => {
    setOpenAddCategoryDialog(true);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
        setPopup({
          open: true,
          msg: "Category name is required",
          severity: "error",
        });
      return;
    }

    try {
      const result = await api.post("seller/categories", {
        name: newCategoryName,
        description: newCategoryDescription,
      });

      if (result.data?.success) {
        setPopup({
          open: true,
          msg: "Category added successfully!",
          severity: "success",
        });
        setOpenAddCategoryDialog(false);
        setNewCategoryName("");
        setNewCategoryDescription("");
        setCategories((prev) => [...prev, result.data.data]);
      } else {
        setPopup({
          open: true,
          msg: result.data.message,
          severity: "error",
        });
      }
    } catch (error) {
      setPopup({
        open: true,
        msg: "Error occurred while adding the category.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Tooltip title="Add new product">
        <Zoom in={true}>
          <Fab
            aria-label="Add"
            color="primary"
            onClick={() => setOpenAddProductDialog(true)}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      </Tooltip>

      {/* Dialog for adding a new product */}
      <AnimatePresence>
        {openAddProductDialog && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dialogVariants}
          >
            <Dialog
              open={openAddProductDialog}
              onClose={() => setOpenAddProductDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle
                sx={{
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#1976d2",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                Add New Product
              </DialogTitle>
              <DialogContentStyled>
                <form onSubmit={handleAddProduct}>
                  <Stack spacing={3}>
                    <DialogCard variants={cardVariants}>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        Product Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Product Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <TitleIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DescriptionIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </DialogCard>

                    <DialogCard variants={cardVariants}>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        Pricing & Stock
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoneyIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AddShoppingCartIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            select
                            label="Is Auction"
                            value={isAuction}
                            onChange={(e) => setIsAuction(e.target.value)}
                            fullWidth
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <GavelIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            <MenuItem value="true">Yes</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                    </DialogCard>

                    <DialogCard variants={cardVariants}>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        Media & Category
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="Image URL"
                            value={image || ""}
                            onChange={(e) => setImage(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhotoCameraIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {image && (
                            <Box sx={{ mt: 1 }}>
                              <img
                                src={image}
                                alt="preview"
                                style={{
                                  height: 120,
                                  objectFit: "contain",
                                  borderRadius: 8,
                                }}
                              />
                            </Box>
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={4}
                          sx={{ display: "flex", alignItems: "flex-end" }}
                        >
                          <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                          >
                            Upload
                            <VisuallyHiddenInput
                              type="file"
                              accept="image/png, image/jpeg"
                              onChange={handleImageChange}
                            />
                          </Button>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          container
                          spacing={1}
                          alignItems="center"
                        >
                          <Grid item xs={10}>
                            <Autocomplete
                              options={categories}
                              getOptionLabel={(option) => option.name}
                              value={
                                categories.find(
                                  (category) => category._id === categoryId
                                ) || null
                              }
                              onChange={(e, newValue) =>
                                setCategoryId(newValue ? newValue._id : "")
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Category"
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CategoryIcon color="action" />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                              fullWidth
                              required
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Tooltip title="Add new category">
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleAddCategoryClick}
                                sx={{ minWidth: "40px", height: "100%" }}
                              >
                                +
                              </Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                    </DialogCard>
                  </Stack>
                  {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <ReCAPTCHA
                                            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}
                                            onChange={(token) => { setRecaptchaOk(!!token); setRecaptchaToken(token || ''); }}
                                            onExpired={() => { setRecaptchaOk(false); setRecaptchaToken(''); }}
                                        />
                                    </Box> */}
                  <DialogActions
                    sx={{ p: 2, borderTop: "1px solid #e0e0e0", mt: 3 }}
                  >
                    <Button
                      onClick={() => setOpenAddProductDialog(false)}
                      sx={{ textTransform: "none", color: "text.secondary" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ textTransform: "none" }}
                    >
                      Add Product
                    </Button>
                  </DialogActions>
                </form>
              </DialogContentStyled>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog for adding a new category */}
      <AnimatePresence>
        {openAddCategoryDialog && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dialogVariants}
          >
            <Dialog
              open={openAddCategoryDialog}
              onClose={() => setOpenAddCategoryDialog(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle
                sx={{
                  fontWeight: 700,
                  fontSize: 20,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                Add New Category
              </DialogTitle>
              <DialogContentStyled>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Category Description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    required
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </DialogContentStyled>
              <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                <Button
                  onClick={() => setOpenAddCategoryDialog(false)}
                  sx={{ textTransform: "none", color: "text.secondary" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCategory}
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: "none" }}
                >
                  Add Category
                </Button>
              </DialogActions>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={popup.open}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: popup.severity === 'error' ? 'error.main' : 'success.main' }}>
          {popup.severity === 'error' ? 'Thông báo' : 'Thành công'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color={popup.severity === 'error' ? 'error.main' : 'success.main'}>
            {popup.msg}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopup((p) => ({ ...p, open: false }))} color={popup.severity === 'error' ? 'error' : 'primary'}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
