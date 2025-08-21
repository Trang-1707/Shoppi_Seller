const mongoose = require("mongoose");

const voucherSellerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"], // % hoặc số tiền cố định
      required: true,
    },
    maxDiscount: {
      type: Number, // số tiền giảm tối đa (dùng cho percentage)
      default: null,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Liên kết với shop (seller)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // hoặc "Seller" nếu bạn có model riêng cho seller
      required: true,
    },

    // Nếu áp dụng cho toàn shop
    applicableShop: {
      type: Boolean,
      default: false,
    },

    // Nếu chỉ áp dụng cho 1 số sản phẩm trong shop
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoucherSeller", voucherSellerSchema);
