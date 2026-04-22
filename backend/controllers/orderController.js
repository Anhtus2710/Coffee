const Order = require('../models/Order');
const Table = require('../models/Table');
const Customer = require('../models/Customer');

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

    // Cap limit to prevent server overload
    const safeLimit = Math.min(Math.max(Number(limit), 1), 100);
    const safePage = Math.max(Number(page), 1);
    const skip = (safePage - 1) * safeLimit;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('table', 'number name zone')
      .populate('servedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);

    res.json({ success: true, total, page: safePage, data: orders });
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
    const { customer, customerName, ...rest } = req.body;
    const orderData = { ...rest, servedBy: req.user._id };
    if (customer) orderData.customer = customer;
    if (customerName) orderData.customerName = customerName;

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

const ORDER_ITEM_STATUS_MAP = {
  pending: 'pending',
  confirmed: 'pending',
  preparing: 'preparing',
  ready: 'ready',
  served: 'served',
  paid: 'served',
  cancelled: 'pending',
};

const ORDER_STATUS_TRANSITIONS = {
  admin: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['served'],
    served: ['paid'],
  },
  waiter: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['served'],
    served: ['paid'],
  },
  barista: {
    preparing: ['ready'],
  },
};

// @route PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('table', 'number name');
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    const role = req.user.role;
    const allowed = ORDER_STATUS_TRANSITIONS[role]?.[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật trạng thái này hoặc chuyển trạng thái không hợp lệ' });
    }

    order.status = status;
    if (status === 'paid') {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
    }

    const itemStatus = ORDER_ITEM_STATUS_MAP[status];
    if (itemStatus) {
      order.items.forEach(item => {
        item.status = itemStatus;
      });
    }

    await order.save();

    // Free table only when paid (not when cancelled)
    if (status === 'paid' && order.table) {
      await Table.findByIdAndUpdate(order.table._id, {
        status: 'available',
        currentOrder: null
      });

      // Tích điểm khách hàng thành viên (1đ/10k)
      if (order.customer) {
        const points = Math.floor(order.total / 10000);
        if (points > 0) {
          await Customer.findByIdAndUpdate(order.customer, {
            $inc: { points, totalSpent: order.total, orderCount: 1 }
          });
        }
      }
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

    const newItems = req.body.items.map(item => ({
      ...item,
      status: 'pending',
    }));

    order.items.push(...newItems);

    // Recalculate subtotal and total
    order.subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    order.total = order.subtotal - order.discount + order.tax;

    if (['ready', 'served'].includes(order.status)) {
      order.status = 'preparing';
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

// @route DELETE /api/orders/:id
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Free table when order is cancelled
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'available',
        currentOrder: null
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};
