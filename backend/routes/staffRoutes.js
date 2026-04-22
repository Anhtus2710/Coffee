const express = require('express');
const router = express.Router();
const { getStaff, getStaffMember, createStaff, updateStaff, toggleStatus, deleteStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getStaff);
router.get('/:id', protect, authorize('admin'), getStaffMember);
router.post('/', protect, authorize('admin'), createStaff);
router.put('/:id', protect, authorize('admin'), updateStaff);
router.patch('/:id/toggle', protect, authorize('admin'), toggleStatus);
router.delete('/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
