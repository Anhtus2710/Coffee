const Customer = require('../models/Customer');

exports.getCustomers = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(filter).sort(
      sort === 'points' ? { points: -1 } : { createdAt: -1 }
    );
    res.json({ success: true, data: customers });
  } catch (err) { next(err); }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

exports.getCustomerByPhone = async (req, res, next) => {
  try {
    const c = await Customer.findOne({ phone: req.params.phone, isActive: true });
    if (!c) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên là bắt buộc' });
    const customer = await Customer.create({ name, phone, email });
    res.status(201).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, note } = req.body;
    const c = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, note },
      { new: true, runValidators: true }
    );
    if (!c) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    c.isActive = !c.isActive;
    await c.save();
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

exports.adjustPoints = async (req, res, next) => {
  try {
    const { points, type } = req.body; // type: 'add' | 'subtract'
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    if (type === 'add') {
      c.points += Math.abs(Number(points));
    } else {
      if (c.points < Math.abs(Number(points))) {
        return res.status(400).json({ success: false, message: 'Điểm không đủ để trừ' });
      }
      c.points -= Math.abs(Number(points));
    }
    await c.save();
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const c = await Customer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!c) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    res.json({ success: true, message: 'Đã xóa khách hàng' });
  } catch (err) { next(err); }
};
