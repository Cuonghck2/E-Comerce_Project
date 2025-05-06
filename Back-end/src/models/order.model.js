const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  idDonHang: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  NguoiDung: {
    id: String,
    HoTen: String,
    Email: String,
    SoDienThoai: String,
  },
  GioHang: {
    DanhSachSanPham: [{
      idSanPham: String,
      TenSanPham: String,
      LoaiSanPham: {
        id: String,
        TenLoaiSanPham: String,
      },
      DanhMuc: {
        id: String,
        TenDanhMuc: String,
        MoTa: String,
        HinhAnh: String,
      },
      DonGia: {
        id: String,
        TenDonGia: String,
      },
      HinhAnh: String,
      SoLuong: Number,
      MauSac: String,
      KichThuoc: {
        id: String,
        TenKichThuoc: {
          type: String,
          enum: ['S', 'M', 'L'],
        }
      },
      GiaTien: Number,
      ThanhTien: Number,
    },
    ],
    TongTienHang: Number,
    GiamGia: Number,
    TamTinh: Number,
    TongTien: Number,
  },
  DiaChiGiaoHang: {
    type: String,
  },
  PhuongThucThanhToan: {
    type: String,
    enum: ['cod','cash', 'credit_card', 'bank_transfer', 'e_wallet', 'paypal'],
  },
  TrangThaiDonHang: {
    type: String,
    enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
    default: "pending",
  },
  GhiChu: String,
  NgayDatHang: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps: true,
}
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const cart = await mongoose.model("Cart").findOne({ Id: this.GioHang.Id });
    const user = await mongoose.model("User").findById(this.NguoiDung.id);

    if (cart && user) {
      // Copy user information
      this.NguoiDung = {
        id: user._id,
        HoTen: user.HoTen,
        Email: user.Email,
        SoDienThoai: user.SoDienThoai,
      };

      // Copy cart information
      this.GioHang = {
        Id: cart.Id,
        DanhSachSanPham: cart.DanhSachSanPham,
        TongTienHang: cart.TongTienHang,
        GiamGia: cart.GiamGia,
        TamTinh: cart.TamTinh,
        TongTien: cart.TongTien,
      };

      // Calculate final total
      this.TongTien = cart.TongTien + this.PhiShip;

      // Update cart status
      cart.TrangThai = "ordered";
      await cart.save();
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
