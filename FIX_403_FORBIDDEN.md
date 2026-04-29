# 🔧 FIX LỖI 403 FORBIDDEN - THANH TOÁN

## ⚠️ VẤN ĐỀ CHÍNH

```
Failed to load resource: the server responded with a status of 403 (Forbidden)
```

Lỗi 403 Forbidden = Yêu cầu bị từ chối vì quyền hạn không đủ.

---

## ✅ CÁC FIX ĐÃ THỰC HIỆN

### 1️⃣ Backend: orderController.js
**Vấn đề**: Admin role không được override các status transitions
**Fix**:
- ✅ Admin luôn được phép cập nhật status (không kiểm tra transitions)
- ✅ Các role khác (waiter, barista) phải kiểm tra ORDER_STATUS_TRANSITIONS
- ✅ Ngăn thanh toán đơn đã paid/cancelled

```javascript
// ✅ Admin luôn được phép
if (role !== 'admin') {
  // Chỉ kiểm tra transitions nếu không phải admin
  const allowed = userRoleTransitions[order.status] || [];
  if (!allowed.includes(status)) {
    return res.status(403).json(...);
  }
}
```

### 2️⃣ Frontend: AdminPage.jsx
**Vấn đề**: Lỗi không rõ ràng, không log debug info
**Fix**:
- ✅ Thêm error logging chi tiết
- ✅ Check order status trước khi thanh toán
- ✅ Log user role để debug

```javascript
console.log('🔵 Thanh toán:', { orderId, orderStatus: order.status, user: auth.user });
```

---

## 🧪 CÁCH TEST FIX

### 🔴 Step 1: Xóa cache & restart server
```bash
# Terminal 1 - Kill server cũ
Ctrl + C

# Terminal 2 - Xóa node_modules cache
del package-lock.json  (hoặc rm package-lock.json)
npm install

# Restart server
npm start
```

### 🔴 Step 2: Check user role
1. **Login AdminPage** với admin account
2. Mở **DevTools** (F12) → **Console**
3. Tìm message: `🔵 Thanh toán:`
   ```
   🔵 Thanh toán: { 
     orderId: "6672e...",
     orderStatus: "served",
     user: { role: "admin", ... }  ← CHECK GIÁ TRỊ NÀY
   }
   ```

### 🔴 Step 3: Test thanh toán
1. **AdminPage** → **📋 Đơn hàng**
2. Tìm đơn ở trạng thái **"Đã phục vụ"** (xanh)
3. Nhấn **"💰 Thanh toán"**

**Kỳ vọng**:
- ✅ Spinner hiển thị
- ✅ Toast: **"✓ Thanh toán thành công"** (xanh)
- ✅ Đơn hàng biến mất hoặc chuyển sang filter 'paid'
- ✅ **Không có lỗi 403**

**Nếu vẫn lỗi 403**:
- ✓ Check console log: user.role là gì?
- ✓ Check order.status là gì? (phải là 'served')
- ✓ Login lại nếu token hết hạn

---

## 🔍 DEBUG INFO CHI TIẾT

### Kiểm tra backend logs:
Khi nhấn "Thanh toán", xem server terminal:
```
✅ EXPECTED: Order updated successfully
❌ WRONG: Role not found / Invalid transition
```

### Kiểm tra request/response:
1. F12 → **Network** tab
2. Tìm request: `PATCH /api/orders/...` 
3. Check:
   - **Headers**: `Authorization: Bearer TOKEN` ✓
   - **Request body**: `{ "status": "paid" }` ✓
   - **Response status**: `200` (success) hoặc `403` (error) ✗
   - **Response body**: In message error nếu có

---

## 🚨 TROUBLESHOOTING

### ❌ Vẫn lỗi 403?

**Khả năng 1: Order status không phải 'served'**
```bash
# Check order status trong database
db.orders.findOne({ orderCode: "CS-..." }).status
# Phải là: 'served'
# Không phải: 'pending', 'preparing', 'ready'
```

**Khả năng 2: User role không đúng**
```javascript
// Check user role trong DevTools Console
localStorage.getItem('user')  // Tìm role field
// Phải là: 'admin' hoặc 'waiter'
// Không phải: 'barista'
```

**Khả năng 3: Token hết hạn**
```bash
# Logout và login lại
# Hoặc reload page (F5)
```

**Khả năng 4: JWT_SECRET không trùng khớp**
```bash
# Kiểm tra file .env
JWT_SECRET=your-secret-key  # Phải giống ở frontend/backend
```

---

## 📋 CHECKLIST NGUYÊN NHÂN

| # | Khả Năng | Kiểm Tra | Fix |
|----|---------|---------|-----|
| 1 | User role không phải admin/waiter | DevTools > console log | Login lại hoặc kiểm tra database |
| 2 | Order status không phải 'served' | DevTools > Network > Response | Tạo order đúng flow: pending→confirmed→preparing→ready→served |
| 3 | Token hết hạn | DevTools > Application > localStorage | Logout và login lại |
| 4 | Server không restart | Terminal server | Ctrl+C và `npm start` |
| 5 | JWT_SECRET khác | .env file | Kiểm tra JWT_SECRET trùng khớp |

---

## ✅ VERIFIED FLOW

### Step-by-step thanh toán (ĐÚNG):
```
1. Admin login → role = 'admin' ✓
2. Tạo order → status = 'pending' ✓
3. Confirm → status = 'confirmed' ✓
4. Prepare (barista) → status = 'preparing' ✓
5. Ready (barista) → status = 'ready' ✓
6. Serve (waiter) → status = 'served' ✓
7. Payment (admin/waiter) → status = 'paid' ✓
8. Table reset → status = 'available' ✓
```

---

## 🎯 EXPECTED RESULT SAU KHI FIX

### Thanh toán thành công:
- ✅ Không lỗi 403 Forbidden
- ✅ Toast xanh: "✓ Thanh toán thành công"
- ✅ Đơn hàng chuyển sang "Đã thanh toán"
- ✅ Bàn reset thành "Trống"
- ✅ Hóa đơn lưu vào database

### User experience:
1. AdminPage → 📋 Đơn hàng
2. Tìm đơn 'served'
3. Click 💰 Thanh toán
4. ✓ Success toast
5. ✓ Đơn biến mất
6. ✓ Bàn trống

---

## 📞 NẾU CÓN LỖI

**Nếu vẫn không hoạt động sau khi thử tất cả:**
1. Check DevTools Console (F12) → xem error message chi tiết
2. Check Server Terminal → xem error logs
3. Check Database → xem dữ liệu order/table
4. Kiểm tra `.env` JWT_SECRET
5. Xóa `node_modules` và cài lại: `npm install`
