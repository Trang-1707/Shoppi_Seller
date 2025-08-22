require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');

const run = async () => {
    const mongoUri = process.env.MONGO_URI;
    const bucket = process.env.MINIO_BUCKET || 'shopii';
    const endpoint = (process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || 'http://63.141.253.242:9000').replace(/\/$/, '');
    const prefix = process.env.MINIO_MIGRATE_PREFIX || 'uploads';

    if (!mongoUri) {
        console.error('Missing MONGO_URI');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);

    const toKey = (urlOrPath) => {
        try {
            const url = new URL(urlOrPath);
            const pathname = url.pathname.split('/').filter(Boolean).pop();
            if (!pathname) return null;
            return `${prefix}/${pathname}`;
        } catch (e) {
            const parts = (urlOrPath || '').split('/');
            const name = parts.pop();
            if (!name) return null;
            return `${prefix}/${name}`;
        }
    };

    const toPublicUrl = (key) => `${endpoint}/${bucket}/${key}`;

    let updated = { products: 0, stores: 0, users: 0 };

    // Products
    const products = await Product.find({ image: { $ne: null } });
    for (const p of products) {
        const key = toKey(p.image);
        if (key) {
            p.image = toPublicUrl(key);
            await p.save();
            updated.products++;
        }
    }

    // Stores
    const stores = await Store.find({ bannerImageURL: { $ne: null } });
    for (const s of stores) {
        const key = toKey(s.bannerImageURL);
        if (key) {
            s.bannerImageURL = toPublicUrl(key);
            await s.save();
            updated.stores++;
        }
    }

    // Users
    const users = await User.find({ avatarURL: { $ne: null } });
    for (const u of users) {
        const key = toKey(u.avatarURL);
        if (key) {
            u.avatarURL = toPublicUrl(key);
            await u.save();
            updated.users++;
        }
    }

    console.log('Migration completed:', updated);
    await mongoose.disconnect();
};

run().catch((e) => {
    console.error(e);
    process.exit(1);
}); 