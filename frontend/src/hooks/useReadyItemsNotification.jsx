import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * Custom hook to monitor for newly ready items
 * Polls every 3 seconds and shows toast notification when items are ready for pickup
 */
export function useReadyItemsNotification() {
  const previousItemsRef = useRef([]);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    // Poll for ready items every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        // Lấy các đơn hàng đang pha chế hoặc đã xong (nhưng chưa thanh toán)
        const [prepRes, servRes] = await Promise.all([
          api.get('/orders?status=preparing&limit=100'),
          api.get('/orders?status=served&limit=100')
        ]);
        
        const currentReadyOrders = [...(prepRes.data.data || []), ...(servRes.data.data || [])];

        // Extract all ready items from orders
        const currentItems = [];
        currentReadyOrders.forEach(order => {
          const readyItems = order.items?.filter(item => item.status === 'ready') || [];
          readyItems.forEach(item => {
            currentItems.push({
              orderId: order._id,
              orderCode: order.orderCode,
              tableNumber: order.tableNumber,
              table: order.table,
              itemId: item._id,
              itemName: item.name,
              quantity: item.quantity,
              size: item.size,
            });
          });
        });

        // Nếu là lần đầu tiên load trang, chỉ lưu lại danh sách chứ không báo
        if (isFirstLoadRef.current) {
          previousItemsRef.current = currentItems;
          isFirstLoadRef.current = false;
          return;
        }

        // Compare with previous items to find NEW items
        const previousIds = previousItemsRef.current.map(
          item => `${item.orderId}-${item.itemId}`
        );

        const newItems = currentItems.filter(
          item => !previousIds.includes(`${item.orderId}-${item.itemId}`)
        );

        // Show toast for each new item
        newItems.forEach(item => {
          const sizeText = item.size && item.size !== 'default' ? ` (${item.size})` : '';
          const tableName = item.table?.name || (item.tableNumber ? `Bàn ${item.tableNumber}` : 'Khách mang về');
          
          toast((t) => (
            <div className="flex flex-col gap-1">
              <p className="font-bold text-slate-800 text-sm">🔔 {tableName}</p>
              <p className="text-emerald-600 font-bold text-sm">✓ {item.quantity}x {item.itemName}{sizeText}</p>
              <p className="text-xs text-slate-400 mt-1">Đã pha chế xong!</p>
            </div>
          ), {
            duration: 8000,
            style: { border: '2px solid #10b981', padding: '12px 16px', background: '#f0fdf4' }
          });
        });

        // Update the reference for next comparison
        previousItemsRef.current = currentItems;
      } catch (error) {
        // Silently catch errors - don't spam console
        console.debug('Ready items polling error:', error);
      }
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);
}
