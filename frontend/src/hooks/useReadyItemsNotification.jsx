import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * Custom hook to monitor for newly ready items
 * Polls every 3 seconds and shows toast notification when items are ready for pickup
 */
export function useReadyItemsNotification() {
  const previousOrdersRef = useRef([]);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    // Poll for ready orders every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        // Chỉ lấy các đơn hàng đã xong toàn bộ (status = 'ready')
        const res = await api.get('/orders?status=ready&limit=100');
        const currentReadyOrders = res.data.data || [];

        // Nếu là lần đầu tiên load trang, chỉ lưu lại danh sách
        if (isFirstLoadRef.current) {
          previousOrdersRef.current = currentReadyOrders.map(o => o._id);
          isFirstLoadRef.current = false;
          return;
        }

        const currentIds = currentReadyOrders.map(o => o._id);
        const newReadyIds = currentIds.filter(id => !previousOrdersRef.current.includes(id));

        // Show toast cho mỗi đơn hàng vừa mới xong
        newReadyIds.forEach(id => {
          const order = currentReadyOrders.find(o => o._id === id);
          const tableName = order.table?.name || (order.tableNumber ? `Bàn ${order.tableNumber}` : 'Khách mang về');
          
          toast((t) => (
            <div className="flex flex-col gap-1">
              <p className="font-bold text-slate-800 text-sm">🔔 {tableName}</p>
              <p className="text-emerald-600 font-bold text-sm">Đã pha chế xong toàn bộ món!</p>
              <p className="text-xs text-slate-400 mt-1">Sẵn sàng phục vụ</p>
            </div>
          ), {
            duration: 8000,
            style: { border: '2px solid #10b981', padding: '12px 16px', background: '#f0fdf4' }
          });
        });

        // Update the reference
        previousOrdersRef.current = currentIds;
      } catch (error) {
        console.debug('Ready items polling error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);
}
