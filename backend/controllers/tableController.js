const Table = require('../models/Table');

exports.getTables = async (req, res, next) => {
  try {
    const { status, zone } = req.query;
    const query = { isActive: true };
    if (status) query.status = status;
    if (zone) query.zone = zone;
    const tables = await Table.find(query)
      .populate('currentOrder', 'orderCode total status createdAt')
      .sort({ number: 1 });
    res.json({ success: true, data: tables });
  } catch (error) { next(error); }
};

exports.createTable = async (req, res, next) => {
  try {
    // Prevent duplicate table numbers
    const existing = await Table.findOne({ number: req.body.number });
    if (existing) {
      return res.status(400).json({ success: false, message: `Số bàn ${req.body.number} đã tồn tại` });
    }
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) { next(error); }
};

exports.updateTable = async (req, res, next) => {
  try {
    // Prevent duplicate table numbers on update
    if (req.body.number) {
      const existing = await Table.findOne({
        number: req.body.number,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: `Số bàn ${req.body.number} đã tồn tại` });
      }
    }
    // Don't allow clearing currentOrder via this endpoint — use updateTableStatus
    const { currentOrder, ...safeData } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, safeData, { new: true });
    if (!table) return res.status(404).json({ success: false, message: 'Không tìm thấy bàn' });
    res.json({ success: true, data: table });
  } catch (error) { next(error); }
};

exports.updateTableStatus = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Không tìm thấy bàn' });
    res.json({ success: true, data: table });
  } catch (error) { next(error); }
};

exports.deleteTable = async (req, res, next) => {
  try {
    await Table.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã xóa bàn' });
  } catch (error) { next(error); }
};
