const axios = require('axios');

/**
 * Verify Google reCAPTCHA token (v2 checkbox)
 * Expects req.body.recaptchaToken from client
 */
const verifyRecaptcha = async (req, res, next) => {
    try {
        const secret = process.env.RECAPTCHA_SECRET;
        const token = req.body && req.body.recaptchaToken;

        if (!secret) {
            return res.status(500).json({ success: false, message: 'Server misconfigured: missing RECAPTCHA_SECRET' });
        }

        if (!token) {
            return res.status(400).json({ success: false, message: 'Missing reCAPTCHA token' });
        }

        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', token);
        if (req.ip) params.append('remoteip', req.ip);

        const resp = await axios.post('https://www.google.com/recaptcha/api/siteverify', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 5000,
        });

        const data = resp.data || {};
        if (data.success !== true) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed', details: data['error-codes'] });
        }

        // Optional: clean token from body
        delete req.body.recaptchaToken;

        return next();
    } catch (err) {
        return res.status(400).json({ success: false, message: 'reCAPTCHA verification error', error: err.message });
    }
};

module.exports = {
    verifyRecaptcha,
}; 