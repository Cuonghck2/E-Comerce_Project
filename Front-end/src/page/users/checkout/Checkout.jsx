import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import { useOrder } from "../../../hooks/useOrder";
import { useDiscount } from "../../../hooks/useDiscount";
import PaymentMethods from "./PaymentMethods";
import { fetchData } from "../../../config/axios";
import PaypalCheckout from "./PaypalCheckout";

const Checkout = () => {
  const navigate = useNavigate();
  const {
    handleFetchCart,
    cartItems,
    handleClearCart, // Add this
  } = useCart();
  const { handleFetchDiscounts, discounts } = useDiscount();

  const { user, getUser } = useAuth();
  const { handleCreateOrder } = useOrder();
  const [formData, setFormData] = useState({
    name: user?.HoVaTen || "",
    phone: user?.SoDienThoai || "",
    email: user?.ThuDienTu || "",
    address: user?.DiaChi || "",
  });

  const [openVoucher, setOpenVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
const [showPaypal, setShowPaypal] = useState(false);
const [paypalOrderDetails, setPaypalOrderDetails] = useState(null);
  const consolidatedCartItems = cartItems.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.idSanPham === item.idSanPham);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleVoucherOpen = () => setOpenVoucher(true);
  const handleVoucherClose = () => setOpenVoucher(false);

  const handleVoucherSelect = (voucher) => {
    setSelectedVoucher(voucher);
    const discount = Math.floor((totalAmount * voucher.PhanTramGiam) / 100);
    setDiscountAmount(discount);
    handleVoucherClose();
  };

  useEffect(() => {
    getUser();
    handleFetchCart();
    handleFetchDiscounts();
  }, []);
  const totalAmount = consolidatedCartItems.reduce((sum, item) => {
    return sum + item.GiaTien * item.quantity;
  }, 0);
  // Add this state near other useState declarations
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Modify handlePlaceOrder to include payment method
  const handlePlaceOrder = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để tiến hành đặt hàng", {
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/auth/user/login");
      }, 3000);
      return;
    }
    if (consolidatedCartItems.length === 0) {
      return;
    }

    try {
      const orderData = {
        GioHang: {
          DanhSachSanPham: consolidatedCartItems.map((item) => ({
            idSanPham: item.idSanPham,
            TenSanPham: item.TenSanPham,
            LoaiSanPham: item.LoaiSanPham,
            DanhMuc: item.DanhMuc,
            DonGia: item.DonGia,
            HinhAnh: item.HinhAnh,
            SoLuong: item.quantity,
            MauSac: item.MauSac,
            KichThuoc: item.KichThuoc,
            GiaTien: item.GiaTien,
            ThanhTien: item.GiaTien * item.quantity,
          })),
          TongTienHang: totalAmount,
          GiamGia: discountAmount,
          TamTinh: totalAmount - discountAmount,
          TongTien: totalAmount - discountAmount,
        },
        TrangThaiDonHang: "pending",
        PhuongThucThanhToan: paymentMethod,
        DiaChiGiaoHang: formData.address,
        GhiChu: formData.note,
      };

      
      
      // Modify the PayPal section in handlePlaceOrder
      if (paymentMethod === "paypal") {
        const order = await handleCreateOrder(orderData);
        if (order) {
          console.log("PayPal order created:", order);
          setPaypalOrderDetails({
            orderId: order.order.idDonHang,
            amount: totalAmount - discountAmount,
          });
          setShowPaypal(true);
        }
      } else {
        const result = await handleCreateOrder(orderData);
        if (result) {
          await handleClearCart();
          toast.success("Đặt hàng thành công!", {
            autoClose: 2000,
          });
          setTimeout(() => {
            navigate("/user/order");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error in order process:", error);
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng", {
        autoClose: 3000,
      });
    }
  };

  return (
    <Box sx={{ maxWidth: "1240px", margin: "0 auto", p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Thông tin giao hàng
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Shipping Information */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <form onSubmit={handlePlaceOrder}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Ghi chú"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
          <PaymentMethods
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              position: "sticky",
              top: 24,
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Đơn hàng của bạn
            </Typography>
            <Box sx={{ mb: 3, bgcolor: "#fff", borderRadius: 1, p: 2 }}>
              <Typography sx={{ mb: 1, fontSize: "0.875rem", color: "#666" }}>
                Mã giảm giá
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleVoucherOpen}
                sx={{
                  color: "#666",
                  borderColor: "#ddd",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#dc0606",
                    bgcolor: "transparent",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {selectedVoucher ? (
                    <>
                      <Typography sx={{ color: "#dc0606", fontWeight: 600 }}>
                        {selectedVoucher.TenChuongTrinh}
                      </Typography>
                      <Typography sx={{ ml: 1, color: "#666" }}>
                        (-{selectedVoucher.PhanTramGiam}%)
                      </Typography>
                    </>
                  ) : (
                    <Typography>Chọn hoặc nhập mã</Typography>
                  )}
                </Box>
                <Typography sx={{ color: "#dc0606", fontWeight: 500 }}>
                  {selectedVoucher ? "Thay đổi" : "Áp dụng"}
                </Typography>
              </Button>
            </Box>
            <Box sx={{ maxHeight: "300px", overflowY: "auto", mb: 2 }}>
              {consolidatedCartItems.map((item) => (
                <Box
                  key={item.idSanPham}
                  sx={{
                    display: "flex",
                    mb: 2,
                    pb: 2,
                    borderBottom: "1px solid #eee",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>
                      {item.TenSanPham}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.GiaTien * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                py: 2,
                borderTop: "1px solid #eee",
                borderBottom: "1px solid #eee",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                  color: "text.secondary",
                }}
              >
                <Typography>Tổng tiền hàng</Typography>
                <Typography>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalAmount)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                  color: "text.secondary",
                }}
              >
                <Typography>Giảm giá</Typography>
                <Typography>
                  -
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(discountAmount)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "text.secondary",
                }}
              >
                <Typography>Phí vận chuyển</Typography>
                <Typography>0₫</Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                mb: 3,
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tổng thanh toán
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "error.main",
                  fontWeight: 600,
                }}
              >
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalAmount - discountAmount)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePlaceOrder}
              sx={{
                py: 1.5,
                backgroundColor: "#303030",
                "&:hover": {
                  backgroundColor: "#404040",
                },
                fontWeight: 600,
              }}
            >
              ĐẶT HÀNG NGAY
            </Button>
          </Paper>
        </Grid>
      </Grid>
      {showPaypal ? (
      <PaypalCheckout
        orderDetails={{
          amount: totalAmount - discountAmount,
          subtotal: totalAmount,
          discount: discountAmount,
          products: consolidatedCartItems,
          shippingAddress: formData.address,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email
        }}
        open={showPaypal}
        onClose={() => setShowPaypal(false)}
        onSuccess={async (paypalOrder) => {
          await handleClearCart();
          navigate("/payment-success");
        }}
        onError={(error) => {
          console.error("Payment error:", error);
          toast.error("Thanh toán thất bại. Vui lòng thử lại.");
          setShowPaypal(false);
        }}
        onCancel={() => {
          toast.info("Đã hủy thanh toán");
          setShowPaypal(false);
        }}
      />
    ) : (
      <>
      </>
    )}
      <ToastContainer />
      <Dialog
        open={openVoucher}
        onClose={handleVoucherClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Chọn mã giảm giá</Typography>
          <IconButton
            onClick={handleVoucherClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {discounts.map((voucher) => (
            <Box
              key={voucher.id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                p: 2,
                borderBottom: "1px solid #eee",
                "&:last-child": { borderBottom: "none" },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                borderRadius: 1,
                transition: "all 0.2s",
              }}
            >
              <FormControlLabel
                control={
                  <Radio
                    checked={selectedVoucher?.id === voucher.id}
                    onChange={() => handleVoucherSelect(voucher)}
                    sx={{
                      "&.Mui-checked": {
                        color: "#dc0606",
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="primary"
                      >
                        {voucher.TenChuongTrinh}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: "#dc0606",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                        }}
                      >
                        -{voucher.PhanTramGiam}%
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Mã:{" "}
                      <span style={{ fontWeight: 600, color: "#dc0606" }}>
                        {voucher.id}
                      </span>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      Hiệu lực:{" "}
                      {new Date(voucher.NgayBatDau).toLocaleDateString("vi-VN")}{" "}
                      -{" "}
                      {new Date(voucher.NgayKetThuc).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  width: "100%",
                  "&:hover": {
                    backgroundColor: "rgba(220, 6, 6, 0.04)",
                  },
                }}
              />
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Checkout;
