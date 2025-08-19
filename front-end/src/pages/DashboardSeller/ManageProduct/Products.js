import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Snackbar,
  TableContainer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Grid } from "@mui/material";
import { TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import UpdateProduct from "./UpdateProduct"; // Đường dẫn đúng file của bạn
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import Chip from "@mui/material/Chip";
import { api } from "../../../services/index";

export default function Products({ products, onProductUpdated }) {
  const navigate = useNavigate();
  const [keywords, setKeywords] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [actionFilter, setActionFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingProduct, setEditingProduct] = React.useState(null);

  const [deletingProduct, setDeletingProduct] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Helper function for navigation to product detail
  const navigateToProduct = (productId) => {
    console.log("Navigating to product:", productId);
    // Make sure path is correct relative to current route
    navigate(`../product/${productId}`);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      // Use direct API call
      await api.delete(`seller/products/${deletingProduct.productId._id}`);
      setSnackbar({
        open: true,
        msg: "Xóa sản phẩm thành công!",
        severity: "success",
      });
      setDeletingProduct(null);
      onProductUpdated(); // Reload lại list từ parent
    } catch (error) {
      setSnackbar({
        open: true,
        msg: "Lỗi khi xóa sản phẩm!",
        severity: "error",
      });
      setDeletingProduct(null);
    }
  };

  const categories = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    const allCategories = products
      .map((p) => p.productId?.categoryId)
      .filter(Boolean); // Filter out null/undefined categoryId
    const map = new Map();
    allCategories.forEach((cat) => {
      if (cat && cat._id && !map.has(cat._id)) {
        map.set(cat._id, cat);
      }
    });
    return Array.from(map.values());
  }, [products]);

  const sortedData = React.useMemo(() => {
    let filtered = products;

    // 1. Lọc theo từ khoá
    if (keywords.trim() !== "") {
      const keywordLower = keywords.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productId?.title &&
          p.productId.title.toLowerCase().includes(keywordLower)
      );
    }

    // 2. Lọc theo category (dựa trên kết quả bước 1)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (p) =>
          p.productId?.categoryId &&
          selectedCategories.includes(p.productId.categoryId._id)
      );
    }

    // 3. Lọc theo trạng thái action (dựa trên kết quả bước 2)
    if (actionFilter === "available") {
      filtered = filtered.filter((p) => p.productId?.isAuction === true);
    }
    if (actionFilter === "notAvailable") {
      filtered = filtered.filter((p) => p.productId?.isAuction === false);
    }
    return [...filtered];
  }, [products, selectedCategories, actionFilter, keywords]);

  const PRODUCTS_PER_PAGE = 5;
  const totalPages = Math.ceil(sortedData.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const pageData = sortedData.slice(startIdx, endIdx);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, actionFilter, keywords]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <React.Fragment>
      <Dialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
      >
        <DialogTitle>Delete Product Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product{" "}
            <b>{deletingProduct?.productId?.title}</b>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingProduct(null)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>

      <Grid>
        <Grid
          container
          spacing={2}
          mb={3}
          alignItems="center"
          justifyContent="space-between"
          paddingTop="25px"
          paddingX="20px"
        >
          <Grid item sx={{ display: "flex", gap: 2 }}>
            {/* Category */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(e.target.value)}
                input={<OutlinedInput label="Category" />}
                renderValue={(selected) => {
                  const names = selected
                    .map(
                      (id) =>
                        categories.find((c) => c._id === id)?.name ||
                        "Uncategorized"
                    )
                    .join(", ");
                  return names;
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    <Checkbox checked={selectedCategories.includes(cat._id)} />
                    <Typography>{cat?.name || "Uncategorized"}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="notAvailable">Not Available</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <TextField
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              label="Search by name product"
              InputProps={{ endAdornment: <SearchIcon /> }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                paddingX: "20px",
                paddingTop: "30px",
              }}
            >
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #ddd",
                  boxShadow: "none",
                  maxWidth: 1200,
                  width: "100%",
                  marginBottom: "20px",
                }}
              >
                <Table sx={{ borderCollapse: "separate" }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "#1890ff",
                        "& .MuiTableCell-root": {
                          fontWeight: 600,
                          color: "#fff",
                          borderBottom: "none",
                          padding: "12px 16px",
                        },
                      }}
                    >
                      <TableCell>Product</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Tool</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pageData?.length ? (
                      <>
                        {" "}
                        {pageData.map((product, index) => (
                          <TableRow
                            style={{ cursor: "pointer" }}
                            key={product.productId._id}
                          >
                            <TableCell
                              onClick={() =>
                                navigateToProduct(product.productId._id)
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 12,
                                }}
                              >
                                <img
                                  src={product.productId?.image}
                                  alt="product"
                                  width={80}
                                  height={80}
                                  style={{
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    border: "1px solid #eee",
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateToProduct(product.productId._id);
                                    }}
                                    sx={{ cursor: "pointer" }}
                                  >
                                    {product.productId?.title}
                                  </Typography>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell
                              onClick={() =>
                                navigateToProduct(product.productId._id)
                              }
                            >{`$${product.productId?.price}`}</TableCell>
                            <TableCell
                              onClick={() =>
                                navigateToProduct(product.productId._id)
                              }
                            >
                              {product.quantity}
                            </TableCell>
                            <TableCell
                              onClick={() =>
                                navigateToProduct(product.productId._id)
                              }
                            >
                              {product.productId?.isAuction ? (
                                <Chip
                                  label="Available"
                                  color="success"
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="Not Available"
                                  color="error"
                                  size="small"
                                />
                              )}
                            </TableCell>

                            <TableCell
                              onClick={() =>
                                navigateToProduct(product.productId._id)
                              }
                            >
                              {product.productId?.categoryId?.name}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Update">
                                <EditIcon
                                  color="primary"
                                  style={{ cursor: "pointer", marginRight: 8 }}
                                  onClick={() => setEditingProduct(product)}
                                />
                              </Tooltip>
                              <Tooltip title="Delete">
                                <DeleteIcon
                                  color="error"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setDeletingProduct(product)}
                                />
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 4, color: "text.secondary" }}
                        >
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {totalPages > 1 && (
              <Stack spacing={2} sx={{ mt: 3, pb: 4 }}>
                <Pagination
                  page={currentPage}
                  count={totalPages}
                  z
                  onChange={(e, value) => setCurrentPage(value)}
                  showFirstButton
                  showLastButton
                  sx={{ display: "flex", justifyContent: "center" }}
                />
              </Stack>
            )}

            {editingProduct && (
              <UpdateProduct
                targetProduct={editingProduct}
                onUpdated={() => {
                  onProductUpdated();
                  setEditingProduct(null);
                }}
                open={Boolean(editingProduct)}
                handleClose={() => setEditingProduct(null)}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
