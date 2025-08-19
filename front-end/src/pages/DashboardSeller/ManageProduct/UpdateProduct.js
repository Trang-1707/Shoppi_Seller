import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import ProductIcon from "@mui/icons-material/LocalMall";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar"; // Dùng Snackbar
import Alert from "@mui/material/Alert"; // Dùng Alert để có màu sắc và icon
import { api } from "../../../services/index";
import {
  Typography,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";

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

export default function UpdateProduct({
  targetProduct,
  onUpdated,
  open,
  handleClose,
}) {
  const [categories, setCategories] = React.useState([]);
  const [title, setTitle] = React.useState(
    targetProduct?.productId?.title || ""
  );
  const [description, setDescription] = React.useState(
    targetProduct?.productId?.description || ""
  );
  const [categoryId, setCategoryId] = React.useState(
    targetProduct?.productId?.categoryId?._id || ""
  );
  const [price, setPrice] = React.useState(
    targetProduct?.productId?.price || 0
  );
  const [image, setImage] = React.useState(
    targetProduct?.productId?.image || ""
  );
  const [isAuction, setIsAuction] = React.useState(
    targetProduct?.productId?.isAuction ? "true" : "false"
  );
  const [auctionEndTime, setAuctionEndTime] = React.useState(
    targetProduct?.productId?.auctionEndTime || ""
  );
  const [quantity, setQuantity] = React.useState(targetProduct?.quantity || 0);

  // State quản lý toast
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    msg: "",
    severity: "success",
  });

  React.useEffect(() => {
    api
      .get("seller/categories")
      .then((res) => setCategories(res.data.data))
      .catch(() =>
        setSnackbar({
          open: true,
          msg: "Failed to load categories.",
          severity: "error",
        })
      );
  }, []);

  React.useEffect(() => {
    setTitle(targetProduct?.productId?.title || "");
    setDescription(targetProduct?.productId?.description || "");
    setCategoryId(targetProduct?.productId?.categoryId?._id || "");
    setPrice(targetProduct?.productId?.price || 0);
    setImage(targetProduct?.productId?.image || "");
    setIsAuction(targetProduct?.productId?.isAuction ? "true" : "false");
    setAuctionEndTime(targetProduct?.productId?.auctionEndTime || "");
    setQuantity(targetProduct?.quantity || 0);
  }, [targetProduct, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const reqBody = {
        title,
        description,
        price: Number(price),
        image,
        categoryId,
        isAuction: isAuction === "true",
        auctionEndTime: isAuction === "true" ? auctionEndTime : undefined,
        quantity: Number(quantity),
      };

      await api.put(`seller/products/${targetProduct.productId._id}`, reqBody);

      // Kích hoạt toast khi thành công
      setSnackbar({
        open: true,
        msg: "Product updated successfully!",
        severity: "success",
      });
      if (onUpdated) onUpdated();
      handleClose();
    } catch (error) {
      // Kích hoạt toast khi thất bại
      setSnackbar({
        open: true,
        msg: error?.response?.data?.message || "An error occurred!",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ fontWeight: 700, fontSize: 24, color: "#1976d2", pb: 1 }}
        >
          Update Product
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please fill in the details below to update your product.
          </Typography>
          <Box component="form" onSubmit={handleUpdateProduct}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: "12px" }}>
              <Typography variant="h6" gutterBottom>
                Product Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Product Name"
                    variant="outlined"
                    fullWidth
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ProductIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {categories.map((cate) => (
                        <MenuItem key={cate._id} value={cate._id}>
                          {cate.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Image URL"
                    variant="outlined"
                    fullWidth
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    variant="outlined"
                    fullWidth
                  >
                    Upload Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            <Paper elevation={2} sx={{ p: 3, borderRadius: "12px" }}>
              <Typography variant="h6" gutterBottom>
                Availability & Stock
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={isAuction}
                      onChange={(e) => setIsAuction(e.target.value)}
                    >
                      <MenuItem value="true">Available</MenuItem>
                      <MenuItem value="false">Not Available</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    variant="outlined"
                    fullWidth
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InventoryIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                {isAuction === "true" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Auction End Time"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={auctionEndTime}
                      onChange={(e) => setAuctionEndTime(e.target.value)}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: "flex-end" }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleUpdateProduct}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Đây là component Snackbar (Toast) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {/* Alert được sử dụng để có giao diện đẹp hơn cho toast */}
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
