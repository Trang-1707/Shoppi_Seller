import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Avatar,
  CircularProgress,
  Rating,
  Stack,
  TextField,
  Button,
  Alert,
  Container,
  styled,
} from "@mui/material";
import { format } from "date-fns";
import { api } from "../../../services/index";
import { useSelector } from "react-redux";

// Styled components for a cleaner UI
const ProductImage = styled("img")({
  width: "100%",
  maxHeight: "450px",
  objectFit: "cover",
  borderRadius: "12px",
});

const ReviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ReplyCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.action.hover,
}));

// Function to group replies under parent reviews
function groupReviews(flatReviews) {
  const reviewsById = {};
  flatReviews.forEach((r) => (reviewsById[r._id] = { ...r, replies: [] }));

  const roots = [];
  flatReviews.forEach((r) => {
    if (r.parentId) {
      if (reviewsById[r.parentId]) {
        reviewsById[r.parentId].replies.push(reviewsById[r._id]);
      }
    } else {
      roots.push(reviewsById[r._id]);
    }
  });

  return roots;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productDetail, setProductDetail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [replyTexts, setReplyTexts] = useState({});
  const [postingReply, setPostingReply] = useState({});
  const [errorReply, setErrorReply] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const productRes = await api.get(`seller/products/${id}`);
        if (!productRes.data?.data) {
          throw new Error("Product data not found.");
        }
        setProductDetail(productRes.data.data);

        const reviewsRes = await api.get(`seller/products/${id}/reviews`);
        const grouped = groupReviews(reviewsRes.data.data || []);
        setReviews(grouped);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setProductDetail(null);
        setError(err.message || "Failed to load product details.");
      }
      setLoading(false);
    };
    fetchData();
  }, [id, token]);

  const handleReplyChange = (reviewId, value) => {
    setReplyTexts((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleSubmitReply = async (reviewId) => {
    const comment = (replyTexts[reviewId] || "").trim();
    if (!comment) return;
    setPostingReply((prev) => ({ ...prev, [reviewId]: true }));
    setErrorReply((prev) => ({ ...prev, [reviewId]: "" }));

    try {
      const res = await api.post(
        `seller/products/${id}/reviews/${reviewId}/reply`,
        { comment }
      );
      const reply = res.data.data;

      setReviews((prev) =>
        prev.map((rev) => {
          if (rev._id === reviewId) {
            const newReplies = rev.replies ? [...rev.replies, reply] : [reply];
            return { ...rev, replies: newReplies };
          }
          return rev;
        })
      );
      setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      setErrorReply((prev) => ({
        ...prev,
        [reviewId]:
          err?.response?.data?.message || "Failed to reply. Please try again.",
      }));
    }
    setPostingReply((prev) => ({ ...prev, [reviewId]: false }));
  };

  if (loading) {
    return (
      <Box p={5} textAlign="center">
        <CircularProgress />
        <Typography mt={2} color="text.secondary">
          Loading product details...
        </Typography>
      </Box>
    );
  }

  if (error || !productDetail?.product) {
    return (
      <Box p={5} textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Product not found!"}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/manage-product")}>
          Back to Products
        </Button>
      </Box>
    );
  }

  const { product, categoryName, inventory, avgRating, totalReviews } =
    productDetail;

  const displayAvgRating = avgRating || 0;
  const displayTotalReviews = totalReviews || 0;

  return (
    <Box>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ProductImage
                src={product.image}
                alt={product.title}
                loading="lazy"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h4" fontWeight="bold" mb={1}>
                  {product.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  mb={2}
                  variant="subtitle1"
                  gutterBottom
                >
                  {categoryName || "N/A"}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="primary.main"
                  mb={2}
                >
                  ${product.price}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Rating
                    value={Number(displayAvgRating)}
                    precision={0.1}
                    readOnly
                    size="large"
                  />
                  <Typography variant="body1" color="text.secondary">
                    ({displayTotalReviews} reviews)
                  </Typography>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" mb={1}>
                  **Description:** {product.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={2}>
                  **Status:**{" "}
                  {product.isAuction ? "Available" : "Not Available"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  **In Stock:** {inventory.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  **Last Updated:**{" "}
                  {inventory.updatedAt
                    ? format(new Date(inventory.updatedAt), "PPP p")
                    : "N/A"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Customer Reviews ({displayTotalReviews})
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {reviews.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No reviews yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to leave a review!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            {reviews.map((review) => (
              <ReviewCard key={review._id}>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item>
                    <Avatar>
                      {review.reviewerId?.username?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography fontWeight="bold">
                      {review.reviewerId?.username || "Anonymous User"}
                    </Typography>
                    <Rating
                      value={review.rating || 0}
                      readOnly
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" mt={1}>
                      {review.createdAt
                        ? format(new Date(review.createdAt), "PPP p")
                        : ""}
                    </Typography>
                  </Grid>
                </Grid>
                {review.replies && review.replies.length > 0 && (
                  <Stack spacing={2} pl={5} mt={2}>
                    {review.replies.map((reply) => (
                      <ReplyCard key={reply._id}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item>
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              {reply.storeName?.[0]?.toUpperCase() || "S"}
                            </Avatar>
                          </Grid>
                          <Grid item xs>
                            <Typography fontWeight="bold">
                              {reply.storeName || "Store"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reply.comment}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              mt={1}
                            >
                              {reply.createdAt
                                ? format(new Date(reply.createdAt), "PPP p")
                                : ""}
                            </Typography>
                          </Grid>
                        </Grid>
                      </ReplyCard>
                    ))}
                  </Stack>
                )}
                <Box mt={2}>
                  <TextField
                    value={replyTexts[review._id] || ""}
                    onChange={(e) =>
                      handleReplyChange(review._id, e.target.value)
                    }
                    placeholder="Reply to this review..."
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={3}
                    disabled={postingReply[review._id]}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    disabled={
                      postingReply[review._id] ||
                      !replyTexts[review._id]?.trim()
                    }
                    onClick={() => handleSubmitReply(review._id)}
                  >
                    {postingReply[review._id] ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Reply"
                    )}
                  </Button>
                  {errorReply[review._id] && (
                    <Typography color="error" variant="caption" ml={1}>
                      {errorReply[review._id]}
                    </Typography>
                  )}
                </Box>
              </ReviewCard>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetail;
