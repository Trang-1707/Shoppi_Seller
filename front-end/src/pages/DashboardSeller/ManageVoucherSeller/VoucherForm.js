import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  InputAdornment,
  Typography,
  IconButton,
  OutlinedInput,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PercentIcon from "@mui/icons-material/Percent";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { api } from "../../../services"; // axios instance baseURL = http://localhost:9999/api

const VoucherSellerForm = ({
  open,
  onClose,
  onSubmit,
  voucher = null,
  isEdit = false,
}) => {
  const initialState = {
    code: "",
    discount: "",
    discountType: "percentage",
    minOrderValue: "",
    usageLimit: "",
    maxDiscount: "",
    expirationDate: "",
    isActive: true,
    applicableShop: false,
    applicableProducts: [],
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);

  // Fetch products when form opens
  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        try {
          setLoadingProducts(true);
          setErrorProducts(null);
          const res = await api.get("/seller/products");
          console.log("Products response:", res.data);
          setProducts(res.data.data || []);
        } catch (err) {
          console.error("Error fetching products:", err);
          setErrorProducts("Failed to load products. Please try again.");
          setProducts([]);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [open]);

  // Nếu đang edit voucher
  useEffect(() => {
    if (voucher && isEdit) {
      setFormData({
        code: voucher.code || "",
        discount: voucher.discount || "",
        discountType: voucher.discountType || "percentage",
        minOrderValue: voucher.minOrderValue || "",
        usageLimit: voucher.usageLimit || "",
        maxDiscount: voucher.maxDiscount || "",
        expirationDate: voucher.expirationDate
          ? formatDateForInput(new Date(voucher.expirationDate))
          : "",
        isActive: voucher.isActive !== undefined ? voucher.isActive : true,
        applicableShop: voucher.applicableShop || false,
        applicableProducts:
          voucher.applicableProducts?.map((p) =>
            typeof p === "object" ? p._id : p
          ) || [],
      });
    } else {
      setFormData(initialState);
    }
  }, [voucher, isEdit, open]);

  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "code" ? value.toUpperCase() : value,
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
      ...(name === "applicableShop" && checked
        ? { applicableProducts: [] }
        : {}),
    });
  };

  const handleProductsChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, applicableProducts: value });
  };

  const validateForm = () => {
    let tempErrors = {};
    let formIsValid = true;

    if (!formData.code || formData.code.trim() === "") {
      tempErrors.code = "Voucher code cannot be empty";
      formIsValid = false;
    } else if (formData.code.length < 3) {
      tempErrors.code = "Voucher code must be at least 3 characters";
      formIsValid = false;
    }

    if (!formData.discount || formData.discount === "") {
      tempErrors.discount = "Discount value cannot be empty";
      formIsValid = false;
    } else if (isNaN(formData.discount) || formData.discount <= 0) {
      tempErrors.discount = "Discount must be a positive number";
      formIsValid = false;
    }

    if (!formData.discountType) {
      tempErrors.discountType = "Discount type is required";
      formIsValid = false;
    }

    if (
      formData.discountType === "percentage" &&
      (!formData.maxDiscount || formData.maxDiscount <= 0)
    ) {
      tempErrors.maxDiscount =
        "Max discount is required when discount type is percentage";
      formIsValid = false;
    }

    if (!formData.expirationDate) {
      tempErrors.expirationDate = "Expiration date cannot be empty";
      formIsValid = false;
    } else {
      const now = new Date();
      const selected = new Date(formData.expirationDate);
      now.setHours(0, 0, 0, 0);
      if (selected < now) {
        tempErrors.expirationDate =
          "Expiration date must be greater than or equal to today";
        formIsValid = false;
      }
    }

    setErrors(tempErrors);
    return formIsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        discount: Number(formData.discount),
        minOrderValue: Number(formData.minOrderValue || 0),
        usageLimit: Number(formData.usageLimit || 1),
        maxDiscount:
          formData.maxDiscount && formData.discountType === "percentage"
            ? Number(formData.maxDiscount)
            : null,
        expirationDate: new Date(formData.expirationDate).toISOString(),
      };
      onSubmit(submitData);
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
    setErrors({});
    onClose();
  };

  const getTodayFormatted = () => formatDateForInput(new Date());

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        {isEdit ? "Edit Voucher" : "Add New Voucher"}
        <IconButton edge="end" color="inherit" onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {/* Voucher fields */}
            <TextField
              label="Voucher Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.code}
              helperText={errors.code}
              disabled={isEdit}
            />
            <TextField
              label="Discount"
              name="discount"
              type="number"
              value={formData.discount}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.discount}
              helperText={errors.discount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formData.discountType === "percentage" ? (
                      <PercentIcon />
                    ) : (
                      <AttachMoneyIcon />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.discountType}
            >
              <InputLabel>Discount Type</InputLabel>
              <Select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                label="Discount Type"
              >
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="fixed">Fixed ($)</MenuItem>
              </Select>
              <FormHelperText>{errors.discountType}</FormHelperText>
            </FormControl>
            {formData.discountType === "percentage" && (
              <TextField
                label="Maximum Discount ($)"
                name="maxDiscount"
                type="number"
                value={formData.maxDiscount}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.maxDiscount}
                helperText={errors.maxDiscount}
              />
            )}
            <TextField
              label="Minimum Order Value ($)"
              name="minOrderValue"
              type="number"
              value={formData.minOrderValue}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Usage Limit"
              name="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Expiration Date"
              name="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayFormatted() }}
              fullWidth
              margin="normal"
              error={!!errors.expirationDate}
              helperText={errors.expirationDate}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label={
              formData.isActive ? "Voucher is active" : "Voucher is inactive"
            }
          />
          <FormControlLabel
            control={
              <Switch
                name="applicableShop"
                checked={formData.applicableShop}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label={
              formData.applicableShop
                ? "Applies to entire shop"
                : "Specific products only"
            }
          />

          {!formData.applicableShop && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Applicable Products</InputLabel>
              {loadingProducts ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : errorProducts ? (
                <Typography color="error">{errorProducts}</Typography>
              ) : (
                <Select
                  multiple
                  value={formData.applicableProducts}
                  onChange={handleProductsChange}
                  input={<OutlinedInput label="Applicable Products" />}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (id) =>
                          products.find((p) => p._id === id)?.productId
                            ?.title || "Unknown Product"
                      )
                      .join(", ")
                  }
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <Checkbox
                        checked={formData.applicableProducts.includes(
                          product._id
                        )}
                      />
                      <Typography>{product.productId?.title}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              )}
              <FormHelperText>
                Select products this voucher applies to
              </FormHelperText>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoucherSellerForm;
