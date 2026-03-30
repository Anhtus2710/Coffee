const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, addItems, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/add-items', protect, addItems);
router.delete('/:id', protect, authorize('admin', 'manager', 'cashier'), cancelOrder);

module.exports = router;
