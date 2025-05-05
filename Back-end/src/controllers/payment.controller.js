const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const generateId = require('../utils/generateId');
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

// Configure PayPal Client
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
  environment: Environment.Sandbox
});

const ordersController = new OrdersController(client);

const paymentController = {
  createPaypalPayment: async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await Order.findOne({ idDonHang: orderId });
      
      if (!order) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      // Convert VND to USD (roughly 1 USD = 24,000 VND)
      const amountInUSD = (order.GioHang.TongTien / 24000).toFixed(2);
      const collect = {
        body: {
            intent: "CAPTURE",
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: "USD",
                        value: "100",
                        breakdown: {
                            itemTotal: {
                                currencyCode: "USD",
                                value: "100",
                            },
                        },
                    },
                    items: [
                        {
                            name: "T-Shirt",
                            unitAmount: {
                                currencyCode: "USD",
                                value: "100",
                            },
                            quantity: "1",
                            description: "Super Fresh Shirt",
                            sku: "sku01",
                        },
                    ],
                },
            ],
        },
        prefer: "return=minimal",
    };

      const { body, statusCode } = await ordersController.createOrder(collect);
      const paypalResponse = JSON.parse(body);

      // Create payment record
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
          MaGiaoDich: paypalResponse.id
        }
      });

      await newPayment.save();

      res.status(statusCode).json({
        orderId: paypalResponse.id,
        approvalUrl: paypalResponse.links.find(link => link.rel === 'approve').href
      });

    } catch (error) {
      console.error('PayPal create order error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  capturePaypalPayment: async (req, res) => {
    try {
      const { orderID } = req.params;
      
      const capture = {
        id: orderID,
        prefer: "return=minimal"
      };

      const { body, statusCode } = await ordersController.captureOrder(capture);
      const captureResponse = JSON.parse(body);

      if (captureResponse.status === 'COMPLETED') {
        // Update payment record
        const paymentRecord = await Payment.findOne({
          'ThongTinThanhToan.MaGiaoDich': orderID
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
        }
      }

      res.status(statusCode).json(captureResponse);
    } catch (error) {
      console.error('PayPal capture error:', error);
      res.status(500).json({ message: error.message });
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