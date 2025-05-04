const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

function generateUserId() {
  const prefix = 'U';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const password = 'maiphuong18';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    try {
      const testUser = new User({
        id: generateUserId(),
        HoVaTen: 'Admin',
        NgaySinh: new Date('2003-01-01'),
        DiaChi: "Cầu Diễn, Hà Nội",
        DanhBaLienLac: '0978853470',
        ThuDienTu: 'maind18@gmail.com',
        SoDienThoai: '0978853470',
        TrangThai: 'active',
        MatKhau: hashedPassword,
        VaiTro: 'admin'
      });

      await testUser.save();
      console.log('Test user created successfully');
      
    } catch (error) {
      console.error('Error creating user:', error);
    }
    
    mongoose.connection.close();
  })
  .catch(err => console.error('Connection error:', err));