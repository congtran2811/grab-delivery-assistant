const express = require('express');
const cors = require('cors');
require('dotenv').config();

const syncRoutes = require('./routes/sync.routes');
const receiptRoutes = require('./routes/receipt.routes');

const app = express();
const port = process.env.PORT || 3001;

// CORS Configuration as per spec
const allowedOrigins = [
  'https://phieuguige.grab-bat.net',
  'http://localhost:5173', // Vite default dev port
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Routes
app.use('/api/v1', syncRoutes);
app.use('/api/v1/orders', receiptRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
