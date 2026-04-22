const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ADMIN_ROLES = ['admin'];

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const effectiveRoles = [userRole];
    if (ADMIN_ROLES.includes(userRole) && !effectiveRoles.includes('admin')) {
      effectiveRoles.push('admin');
    }
    if (!roles.some(role => effectiveRoles.includes(role))) {
      return res.status(403).json({
        success: false,
        message: `Vai trò "${req.user.role}" không có quyền thực hiện thao tác này`
      });
    }
    next();
  };
};
