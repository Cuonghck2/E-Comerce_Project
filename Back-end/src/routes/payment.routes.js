const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Payment routes
router.post('/create-paypal-payment', verifyToken, paymentController.createPaypalPayment);
router.post('/orders/:orderID/capture', verifyToken, paymentController.capturePaypalPayment);
router.get('/cancel', paymentController.cancelPayment);
router.get('/:id', verifyToken, paymentController.getPaymentById);

module.exports = router;