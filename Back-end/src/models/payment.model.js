const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  idThanhToan: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  DonHang: {
    idDonHang: {
      type: String,
      required: true
    },
    NguoiDung: {
      id: String,
      HoTen: String,
      Email: String,
      SoDienThoai: String
    },
    TongTien: Number,
    DiaChiGiaoHang: String
  },
  ThongTinThanhToan: {
    SoTien: {
      type: Number,
      required: true
    },
    PhuongThucThanhToan: {
      type: String,
      enum: ['cash', 'credit_card', 'bank_transfer', 'e_wallet', 'paypal'],
      required: true
    },
    TrangThaiThanhToan: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    NgayThanhToan: {
      type: Date,
      default: null
    },
    MaGiaoDich: {
      type: String,
      trim: true
    }
  },
  GhiChu: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
paymentSchema.index({ idThanhToan: 1 });
paymentSchema.index({ 'DonHang.idDonHang': 1 });
paymentSchema.index({ 'ThongTinThanhToan.TrangThaiThanhToan': 1 });
paymentSchema.index({ 'ThongTinThanhToan.NgayThanhToan': 1 });

// Pre-save middleware to update payment status and date
paymentSchema.pre('save', function(next) {
  if (this.isModified('ThongTinThanhToan.TrangThaiThanhToan') && 
      this.ThongTinThanhToan.TrangThaiThanhToan === 'completed') {
    this.ThongTinThanhToan.NgayThanhToan = new Date();
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;