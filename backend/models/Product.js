const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: { type: String, default: '' },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: 0
  },
  sizes: [{
    name: { type: String, enum: ['S', 'M', 'L'] },
    price: { type: Number }
  }],
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  preparationTime: { type: Number, default: 5 }, // minutes
  calories: { type: Number, default: 0 },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
