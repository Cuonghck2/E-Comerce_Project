const jwt = require('jsonwebtoken');

const authMiddleware = {
  verifyToken: (req, res, next) => {
    console.log(req.cookies);
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Token không hợp lệ' });
    }
  },

  verifyAdmin: (req, res, next) => {
    console.log(req);
    if (req?.user?.VaiTro === 'admin' || req?.body?.user?.VaiTro === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Yêu cầu quyền admin' });
    }
  }
};

module.exports = authMiddleware;