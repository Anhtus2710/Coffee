const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const productImageDir = path.join(__dirname, '../public/images/products');

const sanitizeFilename = (name) => {
  // Chuyển tiếng Việt và ký tự đặc biệt thành ký tự an toàn
  return name
    .normalize('NFD')                        // tách dấu khỏi chữ
    .replace(/[\u0300-\u036f]/g, '')         // xóa dấu
    .replace(/đ/gi, 'd')                     // đ → d
    .replace(/[^a-zA-Z0-9._-]/g, '-')       // ký tự lạ → gạch ngang
    .replace(/-+/g, '-')                     // nhiều gạch ngang → 1
    .replace(/^-|-$/g, '')                   // xóa gạch ngang đầu/cuối
    .toLowerCase();
};

const getImageFilename = (originalName) => {
  if (!originalName) return `${Date.now()}.jpg`;
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const baseName = path.basename(originalName, ext);
  const safeName = sanitizeFilename(baseName);
  // Thêm timestamp để tránh trùng tên file
  return `${safeName}-${Date.now()}${ext}`;
};

const saveProductImage = (filename, fileBuffer) => {
  if (!fs.existsSync(productImageDir)) {
    fs.mkdirSync(productImageDir, { recursive: true });
  }
  const imagePath = path.join(productImageDir, filename);
  fs.writeFileSync(imagePath, fileBuffer);
};

const deleteProductImage = (product) => {
  if (!product || !product.image) return;
  const imagePath = path.join(productImageDir, product.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
};

// @route GET /api/menu
exports.getProducts = async (req, res, next) => {
  try {
    const { category, available, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name icon slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), data: products });
  } catch (error) { next(error); }
};

// @route GET /api/menu/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

// @route POST /api/menu
exports.createProduct = async (req, res, next) => {
  try {
    const productId = new mongoose.Types.ObjectId();
    let imageName = req.body.image || '';

    if (req.file) {
      imageName = getImageFilename(req.file.originalname);
    }

    const productData = {
      ...req.body,
      _id: productId,
      image: imageName
    };

    const product = await Product.create(productData);
    if (req.file) saveProductImage(imageName, req.file.buffer);

    await product.populate('category', 'name icon');
    res.status(201).json({ success: true, data: product });
  } catch (error) { next(error); }
};

// @route PUT /api/menu/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    if (req.file) {
      const oldImage = product.image;
      const imageName = getImageFilename(req.file.originalname);
      updateData.image = imageName;
      saveProductImage(imageName, req.file.buffer);
      if (oldImage && oldImage !== imageName) {
        deleteProductImage({ image: oldImage });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    }).populate('category', 'name icon');
    res.json({ success: true, data: updatedProduct });
  } catch (error) { next(error); }
};

// @route DELETE /api/menu/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    deleteProductImage(product);
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error) { next(error); }
};

// @route PATCH /api/menu/:id/toggle
exports.toggleAvailability = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};