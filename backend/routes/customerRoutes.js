const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCustomers,
  getCustomer,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  toggleStatus,
  adjustPoints,
  deleteCustomer,
} = require('../controllers/customerController');

router.get('/',                     protect, getCustomers);
router.get('/phone/:phone',        protect, getCustomerByPhone);
router.get('/:id',                  protect, getCustomer);
router.post('/',                    protect, createCustomer);
router.put('/:id',                  protect, updateCustomer);
router.patch('/:id/toggle',         protect, toggleStatus);
router.patch('/:id/points',         protect, adjustPoints);
router.delete('/:id',               protect, deleteCustomer);

module.exports = router;
