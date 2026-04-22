const User = require('../models/User');

// @route GET /api/staff
exports.getStaff = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const staff = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, total: staff.length, data: staff });
  } catch (error) { next(error); }
};

// @route GET /api/staff/:id
exports.getStaffMember = async (req, res, next) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
};

// @route POST /api/staff
exports.createStaff = async (req, res, next) => {
  try {
    const staff = await User.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

// @route PUT /api/staff/:id
exports.updateStaff = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const staff = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    });
    if (!staff) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
};

// @route PATCH /api/staff/:id/toggle
exports.toggleStatus = async (req, res, next) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    staff.isActive = !staff.isActive;
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
};

// @route DELETE /api/staff/:id — soft delete
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    res.json({ success: true, message: 'Đã xóa nhân viên' });
  } catch (error) { next(error); }
};
