const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
    if (allowedOrigins.includes(origin) || localhostPattern.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure image directories exist
const imagesDir = path.join(__dirname, 'public/images');
const productImagesDir = path.join(imagesDir, 'products');
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

// ✅ Chỉ cần 1 dòng static này là đủ (xóa các dòng trùng lặp)
app.use('/images', express.static(imagesDir));

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/menu',       require('./routes/menuRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/tables',     require('./routes/tableRoutes'));
app.use('/api/staff',      require('./routes/staffRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/customers',   require('./routes/customerRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Coffee Shop API is running' });
});

// Error handler
app.use(require('./middleware/errorHandler'));

const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    server.listen(startPort, (err) => {
      if (err) {
        server.close();
        resolve(findAvailablePort(startPort + 1));
      } else {
        server.close(() => resolve(startPort));
      }
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Auto-seed if database is empty or in development with no seeded images
const autoSeedIfNeeded = async () => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const count = await Product.countDocuments();
    console.log(`📊 Found ${count} products in database`);
    
    // In development, always reseed if products don't have the expected format
    if (count === 0) {
      console.log('\n🌱 Database is empty. Running seed script...');
      const seedFunction = require('./utils/seed.js');
      await seedFunction();
      console.log('✅ Database seeded with initial data\n');
    } else {
      // Check if existing products have proper image filenames (ObjectId format)
      const products = await Product.find().select('_id name image').lean().limit(1);
      if (products.length > 0) {
        const firstProduct = products[0];
        console.log(`📋 First product: ${firstProduct.name}, image: "${firstProduct.image}"`);
        
        if (firstProduct.image) {
          // Bỏ qua check định dạng ảnh vì hệ thống đã hỗ trợ cả URL Cloudinary
          const isNewFormat = firstProduct.image.match(/^[a-f0-9]{24}\.(jpg|png|jpeg|gif|webp)$/i) || firstProduct.image.startsWith('http');
          console.log(`🔍 Image format check: ${isNewFormat ? '✅ OK' : '⚠️ UNKNOWN FORMAT'}`);
        }
      }
    }
  } catch (err) {
    console.error('Error during auto-seed:', err.message);
  }
};

const startServer = async () => {
  try {
    // Auto-seed if needed
    await autoSeedIfNeeded();

    const PORT = process.env.PORT || 5000;
    const availablePort = await findAvailablePort(parseInt(PORT));

    if (availablePort !== parseInt(PORT)) {
      console.log(`Port ${PORT} is busy, using port ${availablePort} instead.`);
      console.log(`💡 Tip: Thêm PORT=${availablePort} vào file .env để cố định port.`);
    }

    app.listen(availablePort, () => {
      console.log(`☕ Coffee Shop Server running on port ${availablePort}`);
      console.log(`🌐 API: http://localhost:${availablePort}`);
      // ✅ Log rõ URL ảnh để dễ debug
      console.log(`🖼️  Images: http://localhost:${availablePort}/images/products/`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();