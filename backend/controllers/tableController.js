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
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) { next(error); }
};

exports.updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
