const express = require("express");
const { connect } = require("mongoose");
const router = require("./src/routers/index.js");
const dotenv = require("dotenv");
const cors = require("cors");
const { initScheduler } = require("./src/config/scheduler");
const http = require("http");
const { initSocketServer } = require("./src/services/socketService");

const app = express();
dotenv.config(); // Move dotenv.config() before using process.env

// Build allowed origins from env (tolerant to http/https and trailing slashes)
const normalizeOrigin = (value) => {
  try {
    const v = String(value || '').trim();
    if (!v) return [];
    const ensureProtocol = (s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`);
    const url = new URL(ensureProtocol(v));
    const originHttps = `${url.protocol}//${url.host}`.replace(/\/$/, '');
    const originHttp = `http://${url.host}`;
    return Array.from(new Set([originHttps, originHttp]));
  } catch {
    return [];
  }
};

const parseOrigins = () => {
  const list = [];
  if (process.env.CLIENT_URL) list.push(...normalizeOrigin(process.env.CLIENT_URL));
  if (process.env.CLIENT_URLS) {
    process.env.CLIENT_URLS.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(item => list.push(...normalizeOrigin(item)));
  }
  // Common local fallbacks
  list.push('http://localhost:3000');
  list.push('https://localhost:3000');
  return Array.from(new Set(list));
};

const allowedOrigins = parseOrigins();

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body));
  }

  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} for ${req.url}`);
    res.send = originalSend;
    return res.send(body);
  };
  next();
});

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Improve MongoDB connection with error handling
console.log('Connecting to MongoDB...');
connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use("/api", router);

// Fallback route for handling payment redirects
app.get('/', (req, res) => {
  const { paymentStatus } = req.query;
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (paymentStatus) {
    return res.redirect(`${frontendUrl}?paymentStatus=${paymentStatus}`);
  }
  res.redirect(frontendUrl);
});

const server = http.createServer(app);
const io = initSocketServer(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
  console.log(`WebSocket server is running`);
  initScheduler();
});
