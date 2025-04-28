const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const paypal = require('paypal-rest-sdk');
const generateId = require('../utils/generateId');

// Configure PayPal
paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const paymentController = {
  createPaypalPayment: async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await Order.findOne({ idDonHang: orderId });
      
      if (!order) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: `http://localhost:8080/api/payments/success`,
          cancel_url: `http://localhost:8080/api/payments/cancel`
        },
        transactions: [{
          amount: {
            total: (order.GioHang.TongTien).toString(),
            currency: 'USD'
          },
          description: `Thanh toán cho đơn hàng ${orderId}`
        }]
      };

      paypal.payment.create(paymentData, async (error, payment) => {
        if (error) {
          throw error;
        } else {
          // Create payment record in database
          const newPayment = new Payment({
            idThanhToan: generateId('PAY'),
            DonHang: {
              idDonHang: orderId,
              NguoiDung: {
                id: order.NguoiDung.id,
                HoTen: order.NguoiDung.HoTen,
                Email: order.NguoiDung.Email,
                SoDienThoai: order.NguoiDung.SoDienThoai
              },
              TongTien: order.GioHang.TongTien,
              DiaChiGiaoHang: order.DiaChiGiaoHang
            },
            ThongTinThanhToan: {
              SoTien: order.GioHang.TongTien,
              PhuongThucThanhToan: 'paypal',
              TrangThaiThanhToan: 'pending',
              MaGiaoDich: payment.id
            }
          });

          await newPayment.save();

          // Get approval URL
          const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
          res.json({ approvalUrl: approvalUrl.href });
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  executePaypalPayment: async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    try {
      const executePaymentJson = {
        payer_id: payerId
      };

      paypal.payment.execute(paymentId, executePaymentJson, async (error, payment) => {
        if (error) {
          throw error;
        } else {
          // Update payment record
          const paymentRecord = await Payment.findOne({
            'ThongTinThanhToan.MaGiaoDich': paymentId
          });

          if (paymentRecord) {
            paymentRecord.ThongTinThanhToan.TrangThaiThanhToan = 'completed';
            paymentRecord.ThongTinThanhToan.NgayThanhToan = new Date();
            await paymentRecord.save();

            // Update order status
            await Order.findOneAndUpdate(
              { idDonHang: paymentRecord.DonHang.idDonHang },
              { TrangThaiThanhToan: 'completed' }
            );

            res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
          } else {
            throw new Error('Payment record not found');
          }
        }
      });
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
    }
  },

  cancelPayment: async (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
  },

  getPaymentById: async (req, res) => {
    try {
      const payment = await Payment.findOne({ idThanhToan: req.params.id });
      if (!payment) {
        return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = paymentController;