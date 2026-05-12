# Coffee POS System

Hệ thống quản lý quán cà phê hiện đại với các tính năng:
- **Giao diện thân thiện:** Tối ưu trải nghiệm cho thu ngân, nhân viên pha chế và quản lý.
- **Quản lý Đơn hàng (POS):** Đặt món, quản lý bàn, thêm ghi chú (ít đá, nhiều đường,...), thanh toán nhanh.
- **Màn hình Pha chế (Kitchen Display System):** Theo dõi món ăn cần làm theo thời gian thực, đánh dấu hoàn thành.
- **Báo cáo & Thống kê:** Biểu đồ doanh thu theo ngày, tháng, năm.
- **Quản lý Menu:** Thêm, sửa, xóa sản phẩm kèm hình ảnh (tích hợp Cloudinary).
- **Phân quyền người dùng:** Quản lý (Admin), Phục vụ (Waiter), Pha chế (Barista).

## 🛠 Công nghệ & Thư viện sử dụng

### 🔹 Frontend (Giao diện người dùng)
- **[React 18](https://reactjs.org/)**: Thư viện UI cốt lõi.
- **[Vite](https://vitejs.dev/)**: Trình biên dịch siêu tốc, build tool.
- **[Tailwind CSS](https://tailwindcss.com/)**: CSS framework utility-first dùng để thiết kế giao diện linh hoạt.
- **[React Router DOM v6](https://reactrouter.com/)**: Định tuyến (routing) giữa các trang.
- **[Axios](https://axios-http.com/)**: Xử lý gọi API.
- **[Recharts](https://recharts.org/)**: Thư viện vẽ biểu đồ phân tích doanh thu.
- **[React Hot Toast](https://react-hot-toast.com/)**: Hiển thị thông báo (toast).

### 🔹 Backend (Máy chủ & API)
- **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)**: Khung sườn ứng dụng phía server.
- **[MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)**: Cơ sở dữ liệu NoSQL lưu trữ thông tin hệ thống.
- **[JSON Web Token (JWT)](https://jwt.io/)**: Xác thực người dùng (Authentication).
- **[Bcrypt.js](https://www.npmjs.com/package/bcryptjs)**: Mã hóa mật khẩu an toàn.
- **[Cloudinary](https://cloudinary.com/)**: Dịch vụ lưu trữ hình ảnh đám mây.
- **[Multer](https://www.npmjs.com/package/multer) & [Multer Storage Cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)**: Xử lý upload file hình ảnh.

## 🚀 Hướng dẫn cài đặt & chạy ứng dụng

### 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js** (Khuyên dùng bản LTS mới nhất).
- Cơ sở dữ liệu **MongoDB** (Local hoặc MongoDB Atlas).
- Tài khoản **Cloudinary** (để cấu hình lưu ảnh).

### 2. Cài đặt Backend
Di chuyển vào thư mục backend và cài đặt các thư viện:
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend` và điền cấu hình:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/coffee-shop
JWT_SECRET=chuoi_ky_tu_bi_mat_cua_ban

CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban
```

Chạy server Backend:
```bash
npm run dev
```

### 3. Cài đặt Frontend
Mở một terminal mới, di chuyển vào thư mục frontend và cài đặt thư viện:
```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend` (nếu cần đổi URL API):
```env
VITE_API_URL=http://localhost:5000/api
```

Chạy Frontend:
```bash
npm run dev
```

Sau khi khởi chạy thành công, truy cập `http://localhost:5173` để sử dụng ứng dụng.
