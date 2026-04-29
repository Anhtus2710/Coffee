# ☕ Coffee Shop Manager — MERN Stack

Hệ thống quản lý quán cà phê toàn diện xây dựng với **MongoDB, Express, React, Node.js** và **Tailwind CSS**.

---

## � Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js v16+
- MongoDB
- npm hoặc yarn

### 1. Clone và cài đặt dependencies

```bash
git clone <repository-url>
cd coffee-shop

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Cấu hình môi trường

#### Backend (.env)
```bash
cp .env.example .env
# Chỉnh sửa các biến môi trường trong .env
```

#### Frontend (.env)
```bash
# Tạo file .env trong thư mục frontend
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 3. Khởi động MongoDB
```bash
# Đảm bảo MongoDB đang chạy trên localhost:27017
mongod
```

### 4. Chạy ứng dụng

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server sẽ chạy trên http://localhost:5000 (hoặc port khác nếu 5000 bị chiếm)
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Ứng dụng sẽ chạy trên http://localhost:5173
```

### 5. Seed dữ liệu mẫu
```bash
cd backend
node utils/seed.js
```

---

## 🔧 Xử lý lỗi Port bị chiếm

Nếu gặp lỗi `EADDRINUSE` (port đã bị sử dụng):

### Tự động tìm port trống
Backend sẽ tự động tìm port trống bắt đầu từ 5000.

### Thay đổi port thủ công
1. **Backend**: Chỉnh sửa file `backend/.env`
   ```
   PORT=5001
   ```

2. **Frontend**: Chỉnh sửa file `frontend/.env`
   ```
   VITE_API_URL=http://localhost:5001
   ```

### Kiểm tra port đang sử dụng
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

### Giải phóng port
```bash
# Windows - thay PID bằng số từ netstat
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

---

## �🗂 Cấu trúc dự án

```
coffee-shop/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # Kết nối MongoDB
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── tableController.js
│   │   ├── staffController.js
│   │   └── categoryController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   └── errorHandler.js
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   └── Table.js
│   ├── routes/               # Express routes
│   ├── utils/seed.js         # Seed dữ liệu mẫu
│   └── server.js
│
└── frontend/                 # React + Tailwind
    └── src/
        ├── components/
        │   ├── common/       # Modal, StatusBadge
        │   └── layout/       # Layout sidebar
        ├── context/          # AuthContext (JWT)
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── MenuPage.jsx
        │   ├── OrdersPage.jsx
        │   ├── TablesPage.jsx
        │   └── StaffPage.jsx
        ├── services/api.js   # Axios instance
        └── App.jsx
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc Atlas)

### 1. Backend

```bash
cd backend
npm install

# Tạo file .env từ mẫu
cp .env.example .env
# Chỉnh sửa MONGODB_URI và JWT_SECRET trong .env

# Seed dữ liệu mẫu
node utils/seed.js

# Chạy server
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## 🔑 Tài khoản đăng nhập (sau khi seed)

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| admin@coffee.com | 123456 | Admin |
| barista@coffee.com | 123456 | Pha chế |
| waiter@coffee.com | 123456 | Bồi bàn |

---

## 📡 API Endpoints

### Auth
| Method | Route | Mô tả |
|--------|-------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| GET  | `/api/auth/me` | Lấy thông tin user |

### Menu
| Method | Route | Mô tả |
|--------|-------|-------|
| GET    | `/api/menu` | Danh sách sản phẩm |
| POST   | `/api/menu` | Thêm sản phẩm |
| PUT    | `/api/menu/:id` | Sửa sản phẩm |
| DELETE | `/api/menu/:id` | Xóa sản phẩm |
| PATCH  | `/api/menu/:id/toggle` | Bật/tắt bán |

### Orders
| Method | Route | Mô tả |
|--------|-------|-------|
| GET    | `/api/orders` | Danh sách đơn hàng |
| POST   | `/api/orders` | Tạo đơn hàng |
| PATCH  | `/api/orders/:id/status` | Cập nhật trạng thái |
| PATCH  | `/api/orders/:id/add-items` | Thêm món vào đơn |
| DELETE | `/api/orders/:id` | Hủy đơn hàng |

### Tables
| Method | Route | Mô tả |
|--------|-------|-------|
| GET    | `/api/tables` | Danh sách bàn |
| POST   | `/api/tables` | Thêm bàn |
| PATCH  | `/api/tables/:id/status` | Đổi trạng thái bàn |

### Staff
| Method | Route | Mô tả |
|--------|-------|-------|
| GET    | `/api/staff` | Danh sách nhân viên |
| POST   | `/api/staff` | Thêm nhân viên |
| PUT    | `/api/staff/:id` | Sửa thông tin |
| PATCH  | `/api/staff/:id/toggle` | Kích hoạt/vô hiệu |
| DELETE | `/api/staff/:id` | Xóa nhân viên |

---

## ✨ Tính năng

- **Dashboard**: Thống kê nhanh doanh thu, đơn hàng, bàn
- **Menu**: CRUD sản phẩm & danh mục, lọc theo danh mục, bật/tắt bán
- **Đơn hàng**: Tạo đơn (3 bước), cập nhật trạng thái, lọc theo ngày
- **Bàn**: Sơ đồ bàn theo khu vực, đổi trạng thái, xem đơn hiện tại
- **Nhân viên**: CRUD, phân quyền, thống kê theo vai trò
- **JWT Auth**: Bảo vệ route theo vai trò (admin/barista/waiter)

---

## 🔧 Mở rộng gợi ý

- **Báo cáo doanh thu**: Biểu đồ theo ngày/tuần/tháng (Recharts đã cài)
- **WebSocket**: Cập nhật đơn hàng real-time (Socket.io)
- **Upload ảnh**: Cloudinary cho ảnh sản phẩm
- **In hoá đơn**: Kết nối máy in nhiệt
- **Khuyến mãi**: Module voucher & discount
