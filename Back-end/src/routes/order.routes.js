const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Apply verifyToken to all routes
router.use(verifyToken);

// Public routes (require only authentication)
router.get('/user-orders', orderController.getUserOrders);
router.post('/:id/cancel', orderController.cancelOrder);

// Admin routes (require both authentication and admin role)
router.use(verifyAdmin);
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/create', orderController.create);
router.patch('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;