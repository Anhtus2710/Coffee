const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, updateTableStatus, deleteTable } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTables);
router.post('/', protect, authorize('admin', 'manager'), createTable);
router.put('/:id', protect, authorize('admin', 'manager'), updateTable);
router.patch('/:id/status', protect, updateTableStatus);
router.delete('/:id', protect, authorize('admin'), deleteTable);

module.exports = router;
