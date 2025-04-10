require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');
const userRoutes = require('./routes/user.routes');
const supplierRoutes = require('./routes/supplier.routes');
const priceRoutes = require('./routes/price.routes');
const productCategoryRoutes = require('./routes/productCategory.routes');
const logger = require('./logs/logger');
const productTypeRoutes = require('./routes/productType.routes');
const sizeRoutes = require('./routes/size.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const salesRoutes = require('./routes/sales.routes');


const app = express();

// Connect to MongoDB
connectDB();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
const cors = require('cors');
// Thêm vào sau các middleware cơ bản
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Cho phép gửi cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Routes
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/categories', productCategoryRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Commerce API' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info({
    message: 'Server is running on port',
    PORT: PORT,
    timestamp: new Date().toISOString()
  });
});