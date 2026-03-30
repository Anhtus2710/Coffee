const Order = require('../models/Order');
const Table = require('../models/Table');

// @route GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('table', 'number name zone')
      .populate('servedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), data: orders });
  } catch (error) { next(error); }
};

// @route GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'number name zone')
      .populate('items.product', 'name image')
      .populate('servedBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

// @route POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const orderData = { ...req.body, servedBy: req.user._id };

    if (req.body.table) {
      const table = await Table.findById(req.body.table);
      if (table) {
        orderData.tableNumber = table.number;
      }
    }

    const order = await Order.create(orderData);

    // Update table status
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'occupied',
        currentOrder: order._id
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

// @route PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'paid' ? { paymentStatus: 'paid', paidAt: new Date() } : {}) },
      { new: true }
    ).populate('table', 'number name');

    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Free table when paid or cancelled
    if (['paid', 'cancelled'].includes(status) && order.table) {
      await Table.findByIdAndUpdate(order.table._id, {
        status: 'available',
        currentOrder: null
      });
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

// @route PATCH /api/orders/:id/add-items
exports.addItems = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    if (['paid', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Không thể thêm món vào đơn hàng đã đóng' });
    }
    order.items.push(...req.body.items);
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

// @route DELETE /api/orders/:id
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};
