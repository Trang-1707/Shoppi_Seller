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

// Build allowed origins from env
const parseOrigins = () => {
  const list = [];
  if (process.env.CLIENT_URL) list.push(process.env.CLIENT_URL);
  if (process.env.CLIENT_URLS) list.push(...process.env.CLIENT_URLS.split(",").map(s => s.trim()).filter(Boolean));
  // Common local fallbacks
  list.push('http://localhost:3000');
  list.push('https://localhost:3000');
  return Array.from(new Set(list));
};
const allowedOrigins = parseOrigins();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
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
