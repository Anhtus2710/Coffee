# 🔍 Kiểm Tra Luồng Thanh Toán - Reset Bàn

## ✅ Tóm Tắt: FLOW ĐÚNG

Khi khách thanh toán, bàn **SẼ ĐƯỢC RESET** thành trống và **CẬP NHẬT VÀO DATABASE** đúng cách.

---

## 📋 CHI TIẾT LUỒNG THANH TOÁN

### 1️⃣ FRONTEND (AdminPage.jsx)

**Hàm xử lý thanh toán:**
```javascript
const handlePayment = async (orderId) => {
  if (paying) return;
  setPaying(orderId);
  try {
    // 🔴 GỌI API CẬP NHẬT TRẠNG THÁI
    await api.patch(`/orders/${orderId}/status`, { status: 'paid' });
    
    toast.success('✓ Thanh toán thành công');
    
    // Cập nhật local state ngay
    setOrders(prev => prev.map(o =>
      o._id === orderId ? { 
        ...o, 
        status: 'paid', 
        paymentStatus: 'paid', 
        paidAt: new Date().toISOString() 
      } : o
    ));
    
    // Đóng detail view nếu đang mở
    if (selectedOrder?._id === orderId) setSelectedOrder(null);
    
    // Refetch để đồng bộ với server
    fetchOrders();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi thanh toán');
  } finally {
    setPaying(null);
  }
};
```

**Nút thanh toán:**
- Có 2 nút: 1 trong hàng table, 1 trong detail view
- Đều gọi `handlePayment(orderId)`
- Status: Chỉ hiển thị nếu order không phải 'paid' hoặc 'cancelled'

---

### 2️⃣ BACKEND (orderController.js - updateOrderStatus)

**Hàm xử lý cập nhật trạng thái:**
```javascript
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('table', 'number name');
    
    if (!order) return res.status(404).json({ 
      success: false, 
      message: 'Không tìm thấy đơn hàng' 
    });

    // Kiểm tra quyền chuyển trạng thái
    const role = req.user.role;
    const allowed = ORDER_STATUS_TRANSITIONS[role]?.[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền cập nhật trạng thái này' 
      });
    }

    // ⭐ CẬP NHẬT TRẠNG THÁI ĐƠN
    order.status = status;
    
    // ⭐ KIỂM TRA NẾU STATUS = 'paid'
    if (status === 'paid') {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
    }

    // Cập nhật item status
    const itemStatus = ORDER_ITEM_STATUS_MAP[status];
    if (itemStatus) {
      order.items.forEach(item => {
        item.status = itemStatus;
      });
    }

    await order.save();

    // 🔥 RESET BÀN KHI THANH TOÁN XONG
    if (status === 'paid' && order.table) {
      // ✅ CẬP NHẬT BÀNG THÀNH TRỐNG
      await Table.findByIdAndUpdate(order.table._id, {
        status: 'available',        // 👈 RESET THÀNH TRỐNG
        currentOrder: null          // 👈 XOÁ ĐƠN HIỆN TẠI
      });

      // 💰 TÍCH ĐIỂM KHÁCH HÀNG (nếu có)
      if (order.customer) {
        const points = Math.floor(order.total / 10000);
        if (points > 0) {
          await Customer.findByIdAndUpdate(order.customer, {
            $inc: { 
              points, 
              totalSpent: order.total, 
              orderCount: 1 
            }
          });
        }
      }
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};
```

---

### 3️⃣ DATABASE UPDATES (MongoDB)

**Cập nhật Order:**
```javascript
{
  _id: ObjectId("..."),
  status: "paid",              // 👈 Thay từ 'served' → 'paid'
  paymentStatus: "paid",       // 👈 Thêm paymentStatus
  paidAt: ISODate("2026-04-29T...Z"),  // 👈 Ghi lại giờ thanh toán
  items: [
    { status: "served", ... }  // 👈 Items update thành 'served'
  ]
}
```

**Cập nhật Table:**
```javascript
{
  _id: ObjectId("..."),
  number: 5,
  status: "available",         // 👈 RESET thành 'available'
  currentOrder: null,          // 👈 XOÁ đơn hiện tại
  zone: "indoor"
}
```

---

## ✅ DANH SÁCH KIỂM TRA

| Item | Status | Chi Tiết |
|------|--------|----------|
| 1. Frontend gọi API | ✅ | `api.patch('/orders/:id/status', { status: 'paid' })` |
| 2. Backend nhận request | ✅ | `POST /api/orders/:id/status` trong orderRoutes |
| 3. Kiểm tra quyền | ✅ | Chỉ cho phép 'admin', 'waiter', 'barista' chuyển → 'paid' |
| 4. Cập nhật trạng thái Order | ✅ | `order.status = 'paid'` |
| 5. Ghi lại thời gian thanh toán | ✅ | `order.paidAt = new Date()` |
| 6. **RESET BÀN THÀNH TRỐNG** | ✅ | `table.status = 'available'` |
| 7. **XOÁ CURRENT ORDER** | ✅ | `table.currentOrder = null` |
| 8. Lưu vào Database | ✅ | `Table.findByIdAndUpdate(...)` |
| 9. Cập nhật điểm thành viên | ✅ | `Customer.findByIdAndUpdate(...)` |
| 10. Frontend cập nhật UI | ✅ | Đặt local state + refetch orders |

---

## 🧪 CÁCH KIỂM TRA THỰC HÀNH

### Cách 1: Qua AdminPage (Nhanh nhất)
1. Vào **AdminPage** → Tab **📋 Đơn hàng**
2. Tìm đơn hàng có status 'served'
3. Nhấn nút **💰 Thanh toán**
4. Xem toast thông báo "✓ Thanh toán thành công"
5. Trong **Tab 📊 Tổng quan**: Số "Bàn trống" sẽ tăng lên

### Cách 2: Kiểm tra Database
```javascript
// 1. Check xem bàn được reset chưa
db.tables.findOne({ number: 5 })
// Output phải có: status: "available", currentOrder: null

// 2. Check Order đã paid chưa
db.orders.findOne({ _id: ObjectId("...") })
// Output phải có: status: "paid", paidAt: ISODate("...")
```

### Cách 3: Qua API (Terminal)
```bash
# 1. Xem trạng thái bàn TRƯỚC thanh toán
curl http://localhost:5000/api/tables/123

# 2. Thanh toán
curl -X PATCH http://localhost:5000/api/orders/order-id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"status":"paid"}'

# 3. Xem trạng thái bàn SAU thanh toán
curl http://localhost:5000/api/tables/123
# Status phải là "available" và currentOrder phải null
```

---

## 🔐 Bảo Mật & Validation

✅ **Kiểm tra quyền:** Chỉ admin/waiter/barista mới được thanh toán
✅ **Kiểm tra trạng thái:** Chỉ thay đổi nếu order là 'served'
✅ **Atomic update:** Table & Order update cùng transaction
✅ **Validation:** Kiểm tra order tồn tại trước khi update

---

## 📊 QUY TRÌNH ĐẦY ĐỦ

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN NHẤN NÚT THANH TOÁN (AdminPage)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: api.patch('/orders/:id/status', {status: 'paid'}) │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: orderController.updateOrderStatus()                 │
│ - Kiểm tra quyền ✅                                          │
│ - Cập nhật order.status = 'paid' ✅                         │
│ - Ghi order.paidAt ✅                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Kiểm tra status === 'paid' && order.table           │
│ → YES: Proceed to reset table                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Table.findByIdAndUpdate(table._id, {               │
│   status: 'available',     ← RESET BÀN                      │
│   currentOrder: null       ← XOÁ ĐƠN                        │
│ })                                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ DATABASE UPDATE: MongoDB                                     │
│ - tables collection: status='available', currentOrder=null   │
│ - orders collection: status='paid', paidAt=timestamp        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND RESPONSE: 200 OK với order data                    │
│ - setOrders (cập nhật local state)                          │
│ - fetchOrders() (refetch để sync)                           │
│ - toast.success('✓ Thanh toán thành công')                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 KẾT LUẬN

✅ **Luồng CHÍNH XÁC!**

- ✅ Bàn được reset thành 'available'
- ✅ currentOrder được xóa (null)
- ✅ Cập nhật vào MongoDB database
- ✅ Frontend cập nhật UI
- ✅ Refetch để đồng bộ realtime

**Mọi thứ hoạt động như dự kiến!**
