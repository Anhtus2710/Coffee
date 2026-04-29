# ✅ TÓM TẮT FIX LỖI 403 & HƯỚNG DẪN TEST

## 🔧 CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1️⃣ Backend Fix (orderController.js)
```javascript
// ✅ BEFORE (Lỗi): Admin phải tuân theo ORDER_STATUS_TRANSITIONS
const allowed = ORDER_STATUS_TRANSITIONS[role]?.[order.status] || [];
if (!allowed.includes(status)) {
  return res.status(403).json(...);
}

// ✅ AFTER (Fix): Admin bypass transitions check
if (role !== 'admin') {
  const userRoleTransitions = ORDER_STATUS_TRANSITIONS[role];
  if (!userRoleTransitions) {
    return res.status(403).json(...);
  }
  const allowed = userRoleTransitions[order.status] || [];
  if (!allowed.includes(status)) {
    return res.status(403).json(...);
  }
}
```

### 2️⃣ Frontend Improvements (AdminPage.jsx)
- ✅ Thêm import `useAuth` để lấy user info
- ✅ Thêm validation checks:
  - Order status check (paid/cancelled)
  - Order existence check
- ✅ Thêm detailed error logging:
  - User role
  - Order status
  - Error message
  - Full error response
- ✅ Console log: `🔵 Thanh toán: {...}`

### 3️⃣ Vite Config Fix (vite.config.js)
```javascript
// ✅ Updated proxy target
target: process.env.VITE_API_URL || 'http://localhost:5002'
// (Server chạy ở port 5002 khi 5001 busy)
```

---

## 🧪 HƯỚNG DẪN TEST

### Phase 1: Prepare
```bash
# 1. Reload frontend browser
# F5 hoặc Ctrl+Shift+R (hard refresh)

# 2. Hoặc restart Vite dev server (nếu đang chạy)
# Terminal 1 (Frontend): Ctrl+C rồi `npm run dev`
# Terminal 2 (Backend): Đã chạy ở port 5002
```

### Phase 2: Login & Check User Role
1. **AdminPage** → Login bằng admin account
2. Mở **DevTools** (F12)
3. Vào tab **Console**
4. Tìm message:
   ```
   🔵 Thanh toán: { orderId: "...", orderStatus: "served", user: { role: "admin", ... } }
   ```
   ✅ **user.role phải là "admin" hoặc "waiter"**

### Phase 3: Test Thanh Toán
1. **AdminPage** → **📋 Đơn hàng** tab
2. Tìm đơn hàng ở trạng thái **"Đã phục vụ"** (status = 'served')
   - Nếu không có, cần:
     - Tạo order mới
     - Move qua flow: pending→confirmed→preparing→ready→served
3. Nhấn **"💰 Thanh toán"** button

**Expected Result**:
- ✅ Spinner hiển thị (button disabled)
- ✅ Toast xanh: **"✓ Thanh toán thành công"**
- ✅ Đơn hàng biến mất từ bảng (hoặc move sang filter 'paid')
- ✅ **Không có lỗi 403 Forbidden**

### Phase 4: Verify
1. Click filter **"Đã thanh toán"** (tab 'paid')
2. Xem đơn vừa thanh toán
3. Check **DevTools** > **Network** tab:
   - Request `PATCH /api/orders/...`
   - Response status: **200** (✅ success)
   - Response: `{ "success": true, "data": {...} }`

---

## 🐛 TROUBLESHOOTING

### ❌ Vẫn lỗi 403?

**Step 1: Check user.role**
```javascript
// DevTools Console
localStorage.getItem('user')
// Tìm dòng: "role": "admin"
```

**Step 2: Check order.status**
```javascript
// DevTools Console
// Khi click thanh toán, check console.log output:
console.log('🔵 Thanh toán:', {...})
// orderStatus phải là 'served'
```

**Step 3: Check server logs**
```
Terminal (Backend):
- Tìm error message chi tiết
- Check xem role/status được recognize không
```

**Step 4: Restart everything**
```bash
# 1. Kill backend: Ctrl+C
# 2. Kill frontend: Ctrl+C
# 3. Frontend: npm run dev
# 4. Backend: npm start
# 5. Browser: F5 (reload)
```

---

## 📋 CHECKLIST

| # | Item | Status | Note |
|---|------|--------|------|
| 1 | Backend fix applied (orderController.js) | ✅ | Admin bypass transitions |
| 2 | Frontend improvements (AdminPage.jsx) | ✅ | Added useAuth + logging |
| 3 | Vite config updated (5002 port) | ✅ | Proxy fix |
| 4 | Server running on port 5002 | ✅ | Backend up |
| 5 | Frontend dev server running | ❓ | Restart if needed |
| 6 | Browser page reloaded (F5) | ❓ | Hard refresh |
| 7 | User logged in as admin | ❓ | Check role |
| 8 | Order status = 'served' | ❓ | Check order |
| 9 | Click "Thanh toán" button | ❓ | Test |
| 10 | Get success response (200 OK) | ❓ | No 403 |

---

## 🔍 DETAILED DEBUG

### Network Tab (DevTools F12 > Network)
当点击 Thanh toán 时:

1. **Request**:
   ```
   Method: PATCH
   URL: /api/orders/XXXX/status
   Headers: Authorization: Bearer TOKEN
   Body: { "status": "paid" }
   ```

2. **Response (Success)**:
   ```
   Status: 200 OK
   Body: {
     "success": true,
     "data": {
       "_id": "...",
       "status": "paid",
       "paymentStatus": "paid",
       "paidAt": "2026-04-29T...",
       "table": { "status": "available", "currentOrder": null },
       ...
     }
   }
   ```

3. **Response (Error 403)**:
   ```
   Status: 403 Forbidden
   Body: {
     "success": false,
     "message": "Vai trò \"barista\" không được phép cập nhật..."
   }
   ```

---

## 🎯 EXPECTED FINAL RESULT

✅ **Payment Flow Working**:
1. Admin login ✓
2. View order with status 'served' ✓
3. Click "Thanh toán" ✓
4. **No 403 error** ✓
5. Toast success ✓
6. Order status → 'paid' ✓
7. Table status → 'available' ✓
8. Hóa đơn saved in database ✓

---

## 📞 NEXT STEPS

### If Success ✅
- Everything works! System ready to use.
- Document payment process complete.

### If Still Error ❌
1. Check console logs: `🔵 Thanh toán: {...}`
2. Check Network Response: error message
3. Check Server Terminal: error logs
4. Check Database: order & table data
5. Verify JWT_SECRET matches
6. Clear localStorage and login again

---

## 🎬 TEST SCENARIO (Full)

```
Timeline: 10-15 minutes

1. [2 min]  Login AdminPage as admin
2. [3 min]  Navigate to Orders tab, find 'served' order
3. [1 min]  Open DevTools (F12) > Console
4. [1 min]  Click "Thanh toán" button
5. [2 min]  Check logs: "🔵 Thanh toán: {...}"
            Verify: user.role = "admin", orderStatus = "served"
6. [2 min]  Check response toast: "✓ Thanh toán thành công"
7. [2 min]  Verify order moved to 'paid' filter
8. [2 min]  Check DevTools Network: response status 200 OK

Total Time: ~15 minutes
Success: No 403 error, payment successful
```

---

**All fixes applied! Ready to test! 🚀**
