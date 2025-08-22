const rateLimit = require('express-rate-limit');

// Limit product creation: e.g., max 10 new products per 10 minutes per user
const productCreateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        return (req.user && req.user.id) || req.ip;
    },
    message: {
        success: false,
        message: 'Rate limit exceeded. Please wait before creating more products.'
    }
});

module.exports = {
    productCreateLimiter,
}; 