const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, sparse: true },
  email: { type: String, sparse: true },
  points: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  note: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

customerSchema.index({ phone: 1 }, { sparse: true });
customerSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model('Customer', customerSchema);
