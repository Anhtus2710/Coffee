const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleAvailability } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, authorize('admin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateProduct);
router.patch('/:id/toggle', protect, authorize('admin', 'barista'), toggleAvailability);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
