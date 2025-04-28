const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Payment routes
router.post('/create-paypal-payment', verifyToken, paymentController.createPaypalPayment);
router.get('/success', paymentController.executePaypalPayment);
router.get('/cancel', paymentController.cancelPayment);
router.get('/:id', verifyToken, paymentController.getPaymentById);

module.exports = router;