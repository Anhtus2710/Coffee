const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/menu',     require('./routes/menuRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/tables',   require('./routes/tableRoutes'));
app.use('/api/staff',    require('./routes/staffRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Coffee Shop API is running' });
});

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`☕ Coffee Shop Server running on port ${PORT}`);
});
