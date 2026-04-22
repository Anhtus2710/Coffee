const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  addItems,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.post("/", protect, createOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.patch("/:id/add-items", protect, addItems);
router.delete(
  "/:id",
  protect,
  authorize("admin", "waiter"),
  cancelOrder,
);

// Get orders by table ID
router.get("/table/:tableId", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({
      table: req.params.tableId,
      status: { $nin: ['paid', 'cancelled'] }
    })
      .populate('items.product', 'name price image')
      .populate('servedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

router.get('/barista', protect, authorize('barista', 'admin'), async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing'] },
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

router.get('/barista/history', protect, authorize('barista', 'admin'), async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $in: ['ready', 'served'] },
    }).sort({ updatedAt: -1 }).limit(50);
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

router.put('/item/:orderId/:itemId', protect, authorize('barista', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    const item = order.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy món trong đơn hàng' });
    item.status = status;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái món', error: error.message });
  }
});

module.exports = router;
