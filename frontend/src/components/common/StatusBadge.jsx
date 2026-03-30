const STATUS_CONFIG = {
  // Order statuses
  pending:    { label: 'Chờ xác nhận', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  confirmed:  { label: 'Đã xác nhận',  color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  preparing:  { label: 'Đang pha chế', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  ready:      { label: 'Sẵn sàng',     color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  served:     { label: 'Đã phục vụ',   color: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  paid:       { label: 'Đã thanh toán',color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  cancelled:  { label: 'Đã hủy',       color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  // Table statuses
  available:  { label: 'Trống',        color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  occupied:   { label: 'Đang dùng',    color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  reserved:   { label: 'Đặt trước',    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  cleaning:   { label: 'Đang dọn',     color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  // Staff statuses
  active:     { label: 'Đang làm',     color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  inactive:   { label: 'Nghỉ việc',    color: 'bg-stone-500/15 text-stone-400 border-stone-500/20' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-stone-500/15 text-stone-400 border-stone-500/20' };
  return (
    <span className={`badge border ${cfg.color}`}>{cfg.label}</span>
  );
}
