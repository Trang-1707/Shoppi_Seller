const Product = require("../models/Product");
const VoucherSeller = require("../models/VoucherSeller");

// @desc    Seller tạo voucher mới
// @route   POST /api/seller/vouchers
// @access  Private/Seller
const createVoucher = async (req, res, next) => {
  try {
    const sellerId = req.user.id; // lấy từ token của seller

    const {
      code,
      discount,
      expirationDate,
      minOrderValue,
      usageLimit,
      maxDiscount,
      discountType,
      applicableProducts,
      applicableShop,
    } = req.body;

    const voucher = new VoucherSeller({
      sellerId,
      code,
      discount,
      discountType,
      expirationDate,
      minOrderValue,
      usageLimit,
      maxDiscount,
      applicableShop: applicableShop || false,
      applicableProducts: applicableShop ? [] : applicableProducts || [],
    });

    const createdVoucher = await voucher.save();
    res.status(201).json(createdVoucher);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy tất cả voucher của seller
// @route   GET /api/seller/vouchers
// @access  Private/Seller
const getVouchers = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const vouchers = await VoucherSeller.find({ sellerId });
    res.json(vouchers);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy voucher theo ID (của seller)
// @route   GET /api/seller/vouchers/:id
// @access  Private/Seller
const getVoucherById = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const voucher = await VoucherSeller.findOne({
      _id: req.params.id,
      sellerId,
    });

    if (voucher) {
      res.json(voucher);
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update voucher (seller chỉ update voucher của mình)
// @route   PUT /api/seller/vouchers/:id
// @access  Private/Seller
const updateVoucher = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const {
      code,
      discount,
      expirationDate,
      minOrderValue,
      usageLimit,
      maxDiscount,
      isActive,
      discountType,
      applicableProducts,
      applicableShop,
    } = req.body;

    const voucher = await VoucherSeller.findOne({
      _id: req.params.id,
      sellerId,
    });

    if (voucher) {
      voucher.code = code || voucher.code;
      voucher.discount = discount || voucher.discount;
      voucher.expirationDate = expirationDate || voucher.expirationDate;
      voucher.minOrderValue = minOrderValue || voucher.minOrderValue;
      voucher.usageLimit = usageLimit || voucher.usageLimit;
      voucher.maxDiscount = maxDiscount || voucher.maxDiscount;
      voucher.discountType = discountType || voucher.discountType;
      voucher.isActive = isActive !== undefined ? isActive : voucher.isActive;

      if (applicableShop !== undefined) {
        voucher.applicableShop = applicableShop;
        voucher.applicableProducts = applicableShop
          ? []
          : applicableProducts || voucher.applicableProducts;
      }

      const updatedVoucher = await voucher.save();
      res.json(updatedVoucher);
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa voucher (seller chỉ xóa của mình)
// @route   DELETE /api/seller/vouchers/:id
// @access  Private/Seller
const deleteVoucher = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const voucher = await VoucherSeller.findOne({
      _id: req.params.id,
      sellerId,
    });

    if (voucher) {
      await voucher.remove();
      res.json({ message: "Voucher removed" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/tắt trạng thái voucher
// @route   PUT /api/seller/vouchers/:id/toggle-active
// @access  Private/Seller
const toggleVoucherActive = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const voucher = await VoucherSeller.findOne({
      _id: req.params.id,
      sellerId,
    });

    if (voucher) {
      voucher.isActive = !voucher.isActive;
      const updatedVoucher = await voucher.save();
      res.json(updatedVoucher);
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Tìm voucher theo mã (cho buyer)
// @route   GET /api/vouchers/code/:code
// @access  Public (hoặc Private/Buyer nếu cần login)
const getVoucherSellerByCode = async (req, res, next) => {
  try {
    const code = req.params.code;
    const productId = req.query.productId; // nhận productId từ query
    const now = new Date();

    if (!productId) {
      return res.status(400).json({ message: "Vui lòng gửi productId" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const voucher = await VoucherSeller.findOne({ code });
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ message: "Voucher không khả dụng" });
    }

    if (voucher.expirationDate < now) {
      return res.status(400).json({ message: "Voucher đã hết hạn" });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" });
    }

    // Kiểm tra sản phẩm có cùng seller
    if (!product.sellerId.equals(voucher.sellerId)) {
      return res
        .status(400)
        .json({ message: "Voucher không áp dụng cho sản phẩm này" });
    }

    // Kiểm tra sản phẩm có được áp dụng voucher không
    if (
      !voucher.applicableShop &&
      !voucher.applicableProducts.some((p) => p.equals(product._id))
    ) {
      return res
        .status(400)
        .json({ message: "Voucher không áp dụng cho sản phẩm này" });
    }

    res.json(voucher);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  toggleVoucherActive,
  getVoucherSellerByCode,
};
