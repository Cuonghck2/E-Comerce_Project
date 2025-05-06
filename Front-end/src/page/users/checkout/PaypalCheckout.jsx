import { useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Box, Typography, Paper, CircularProgress, Dialog, DialogTitle, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CloseIcon from '@mui/icons-material/Close';

const PaypalCheckout = ({ orderDetails, onSuccess, onError, onCancel, open, onClose }) => {
  const navigate = useNavigate();

  const initialOptions = {
    clientId: "AXzuZ78ViOh_P9P-HGL4ve4-i2wPBXa1XAjx9WL7Lg71s_hKbYgAsX7toNJ6ce2R44DXuASMHe3yXLRx",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = (data, actions) => {
    const amountInUSD = (orderDetails.amount / 24000).toFixed(2);
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amountInUSD,
            currency_code: "USD",
          },
          description: `Order: ${orderDetails.orderId}`,
        },
      ],
    });
  };
  const onApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();
      onSuccess(order);
      toast.success("Thanh toán thành công đang chuyển đến đơn hàng của bạn",{
        autoClose: 2000,
      });
      timeout(() => {
        navigate("/user/order");
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      onError(error);
    }
  };
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Thanh toán PayPal</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Chi tiết đơn hàng
          </Typography>

          {/* Products List */}
          <Box sx={{ mb: 3, maxHeight: 200, overflowY: 'auto' }}>
            {orderDetails.products?.map((item) => (
              <Box key={item.idSanPham} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1,
                pb: 1,
                borderBottom: '1px solid #eee'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.TenSanPham}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.KichThuoc?.TenKichThuoc} x {item.SoLuong}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(item.ThanhTien)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Order Summary */}
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tổng tiền hàng:</Typography>
              <Typography>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(orderDetails.subtotal || orderDetails.amount)}
              </Typography>
            </Box>
            {orderDetails.discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Giảm giá:</Typography>
                <Typography color="error.main">
                  -{new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(orderDetails.discount)}
                </Typography>
              </Box>
            )}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: '1px dashed #ddd',
              pt: 1,
              mt: 1,
              fontWeight: 600
            }}>
              <Typography>Tổng thanh toán:</Typography>
              <Typography color="error.main">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(orderDetails.amount)}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
            Số tiền sẽ được quy đổi sang USD để thanh toán:
          </Typography>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
            ${(orderDetails.amount / 24000).toFixed(2)} USD
          </Typography>
        </Box>

        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onCancel={() => {
              onCancel();
              toast.info("Đã hủy thanh toán");
              navigate("/user/checkout");
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              onError(err);
              toast.error("Đã xảy ra lỗi trong quá trình thanh toán");
            }}
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "pay",
            }}
          />
        </PayPalScriptProvider>
      </Box>
    </Dialog>
  );
};

export default PaypalCheckout;