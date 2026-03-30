# ☕ Coffee Shop Manager — MERN Stack

Hệ thống quản lý quán cà phê toàn diện xây dựng với **MongoDB, Express, React, Node.js** và **Tailwind CSS**.

---

## 🗂 Cấu trúc dự án

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
| manager@coffee.com | 123456 | Quản lý |
| barista@coffee.com | 123456 | Pha chế |
| waiter@coffee.com | 123456 | Phục vụ |
| cashier@coffee.com | 123456 | Thu ngân |

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
- **JWT Auth**: Bảo vệ route theo vai trò (admin/manager/barista/waiter/cashier)

---

## 🔧 Mở rộng gợi ý

- **Báo cáo doanh thu**: Biểu đồ theo ngày/tuần/tháng (Recharts đã cài)
- **WebSocket**: Cập nhật đơn hàng real-time (Socket.io)
- **Upload ảnh**: Cloudinary cho ảnh sản phẩm
- **In hoá đơn**: Kết nối máy in nhiệt
- **Khuyến mãi**: Module voucher & discount
