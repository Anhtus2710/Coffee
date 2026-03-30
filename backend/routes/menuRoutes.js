const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleAvailability } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, authorize('admin', 'manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), updateProduct);
router.patch('/:id/toggle', protect, authorize('admin', 'manager', 'barista'), toggleAvailability);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
