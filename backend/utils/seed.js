const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Table = require('../models/Table');
const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  // Clear
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Table.deleteMany({});

  // Users
  await User.create([
    { name: 'Admin Quán', email: 'admin@coffee.com', password: '123456', role: 'admin', phone: '0901234567', salary: 15000000 },
    { name: 'Nguyễn Văn A', email: 'manager@coffee.com', password: '123456', role: 'manager', phone: '0912345678', salary: 12000000 },
    { name: 'Trần Thị B', email: 'barista@coffee.com', password: '123456', role: 'barista', phone: '0923456789', salary: 8000000, shift: 'morning' },
    { name: 'Lê Văn C', email: 'waiter@coffee.com', password: '123456', role: 'waiter', phone: '0934567890', salary: 7000000, shift: 'afternoon' },
    { name: 'Phạm Thị D', email: 'cashier@coffee.com', password: '123456', role: 'cashier', phone: '0945678901', salary: 7500000 },
  ]);
  console.log('✅ Users seeded');

  // Categories
  const cats = await Category.create([
    { name: 'Cà Phê', icon: '☕', sortOrder: 1 },
    { name: 'Trà & Trà Sữa', icon: '🍵', sortOrder: 2 },
    { name: 'Sinh Tố', icon: '🥤', sortOrder: 3 },
    { name: 'Bánh & Snack', icon: '🍰', sortOrder: 4 },
    { name: 'Nước Ép', icon: '🍊', sortOrder: 5 },
  ]);
  console.log('✅ Categories seeded');

  const [cf, tea, sm, cake, juice] = cats;

  // Products
  await Product.create([
    { name: 'Cà Phê Đen', category: cf._id, price: 25000, description: 'Cà phê đen truyền thống', isAvailable: true, isFeatured: true, preparationTime: 3 },
    { name: 'Cà Phê Sữa', category: cf._id, price: 30000, description: 'Cà phê đen pha sữa đặc', isAvailable: true, isFeatured: true, preparationTime: 3 },
    { name: 'Bạc Xỉu', category: cf._id, price: 32000, description: 'Ít cà phê nhiều sữa', isAvailable: true, preparationTime: 3 },
    { name: 'Cappuccino', category: cf._id, price: 55000, description: 'Espresso với sữa bọt mịn', isAvailable: true, isFeatured: true, preparationTime: 5, sizes: [{ name: 'S', price: 45000 }, { name: 'M', price: 55000 }, { name: 'L', price: 65000 }] },
    { name: 'Latte', category: cf._id, price: 60000, description: 'Espresso với sữa hấp', isAvailable: true, preparationTime: 5, sizes: [{ name: 'S', price: 50000 }, { name: 'M', price: 60000 }, { name: 'L', price: 70000 }] },
    { name: 'Trà Đào', category: tea._id, price: 45000, description: 'Trà xanh với đào thơm ngon', isAvailable: true, isFeatured: true, preparationTime: 4 },
    { name: 'Trà Sữa Truyền Thống', category: tea._id, price: 40000, description: 'Trà sữa Hong Kong classic', isAvailable: true, preparationTime: 4, sizes: [{ name: 'M', price: 40000 }, { name: 'L', price: 50000 }] },
    { name: 'Trà Sữa Matcha', category: tea._id, price: 55000, description: 'Matcha Nhật Bản pha trà sữa', isAvailable: true, preparationTime: 5 },
    { name: 'Sinh Tố Bơ', category: sm._id, price: 55000, description: 'Bơ Đắk Lắk tươi xanh', isAvailable: true, isFeatured: true, preparationTime: 5 },
    { name: 'Sinh Tố Dâu', category: sm._id, price: 50000, description: 'Dâu tươi xay nhuyễn', isAvailable: true, preparationTime: 5 },
    { name: 'Bánh Croissant', category: cake._id, price: 35000, description: 'Bánh sừng bò bơ Pháp', isAvailable: true, preparationTime: 2 },
    { name: 'Bánh Tiramisu', category: cake._id, price: 65000, description: 'Tiramisu Ý classic', isAvailable: true, isFeatured: true, preparationTime: 2 },
    { name: 'Nước Ép Cam', category: juice._id, price: 40000, description: 'Cam vắt tươi', isAvailable: true, preparationTime: 4 },
    { name: 'Nước Ép Dưa Hấu', category: juice._id, price: 35000, description: 'Dưa hấu tươi mát', isAvailable: true, preparationTime: 4 },
  ]);
  console.log('✅ Products seeded');

  // Tables
  const tableData = [];
  for (let i = 1; i <= 8; i++) tableData.push({ number: i, capacity: 4, zone: 'indoor' });
  for (let i = 9; i <= 12; i++) tableData.push({ number: i, capacity: 2, zone: 'outdoor' });
  tableData.push({ number: 13, name: 'Bàn VIP 1', capacity: 6, zone: 'vip' });
  tableData.push({ number: 14, name: 'Bàn VIP 2', capacity: 8, zone: 'vip' });
  tableData.push({ number: 15, name: 'Quầy Bar', capacity: 4, zone: 'bar' });
  await Table.create(tableData);
  console.log('✅ Tables seeded');

  console.log('\n🎉 Seed completed!');
  console.log('📧 Login: admin@coffee.com / 123456');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
