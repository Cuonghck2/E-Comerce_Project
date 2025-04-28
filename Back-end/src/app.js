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
const styleRoutes = require('./routes/style.routes');
const discountRoutes = require('./routes/discount.routes');
const productRoutes = require('./routes/product.routes');
const warehouseRoutes = require('./routes/warehouse.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Connect to MongoDB
connectDB();
// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
app.use('/api/styles', styleRoutes);
app.use('/api/discounts', discountRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/warehouse', warehouseRoutes);
// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Commerce API' });
});

// Add this after other middleware
app.use('/uploads', express.static('public/uploads'));
app.use('/api/payments', paymentRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info({
    message: 'Server is running on port',
    PORT: PORT,
    timestamp: new Date().toISOString()
  });
});