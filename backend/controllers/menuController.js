const Product = require('../models/Product');

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
    const product = await Product.create(req.body);
    await product.populate('category', 'name icon');
    res.status(201).json({ success: true, data: product });
  } catch (error) { next(error); }
};

// @route PUT /api/menu/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('category', 'name icon');
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

// @route DELETE /api/menu/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
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
