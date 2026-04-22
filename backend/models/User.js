const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên nhân viên là bắt buộc'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'barista', 'waiter'],
    default: 'waiter'
  },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'full'],
    default: 'full'
  },
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
