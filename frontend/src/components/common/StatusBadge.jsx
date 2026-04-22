const STATUS_CONFIG = {
  pending:    { label: 'Chờ xác nhận',  bg: 'rgba(250,204,21,0.12)',  text: '#FACC15', border: 'rgba(250,204,21,0.20)' },
  confirmed:  { label: 'Đã xác nhận',   bg: 'rgba(96,165,250,0.12)',  text: '#60A5FA', border: 'rgba(96,165,250,0.20)' },
  preparing:  { label: 'Đang pha chế',  bg: 'rgba(251,146,60,0.12)',  text: '#FB923C', border: 'rgba(251,146,60,0.20)' },
  ready:      { label: 'Sẵn sàng',      bg: 'rgba(74,222,128,0.12)',  text: '#4ADE80', border: 'rgba(74,222,128,0.18)' },
  served:     { label: 'Đã phục vụ',    bg: 'rgba(129,140,248,0.12)', text: '#818CF8', border: 'rgba(129,140,248,0.20)' },
  paid:       { label: 'Đã thanh toán', bg: 'rgba(52,211,153,0.12)',  text: '#34D399', border: 'rgba(52,211,153,0.18)' },
  cancelled:  { label: 'Đã hủy',        bg: 'rgba(239,68,68,0.10)',   text: '#F87171', border: 'rgba(239,68,68,0.18)' },
  available:  { label: 'Trống',         bg: 'rgba(74,222,128,0.10)',  text: '#4ADE80', border: 'rgba(74,222,128,0.18)' },
  occupied:   { label: 'Đang dùng',     bg: 'rgba(239,68,68,0.10)',  text: '#F87171', border: 'rgba(239,68,68,0.18)' },
  reserved:   { label: 'Đặt trước',     bg: 'rgba(250,204,21,0.10)',  text: '#FACC15', border: 'rgba(250,204,21,0.18)' },
  cleaning:   { label: 'Đang dọn',      bg: 'rgba(192,132,252,0.12)', text: '#C084FC', border: 'rgba(192,132,252,0.20)' },
  active:     { label: 'Đang làm',      bg: 'rgba(74,222,128,0.10)',  text: '#4ADE80', border: 'rgba(74,222,128,0.18)' },
  inactive:   { label: 'Nghỉ việc',    bg: 'rgba(100,116,139,0.12)',text: '#64748B', border: 'rgba(100,116,139,0.20)' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg: 'rgba(100,116,139,0.10)',
    text: '#64748B',
    border: 'rgba(100,116,139,0.15)',
  };
  return (
    <span
      className="badge"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
        borderWidth: 1,
        borderStyle: 'solid',
      }}
    >
      {cfg.label}
    </span>
  );
}
