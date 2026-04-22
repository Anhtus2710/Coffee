const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Table = require("../models/Table");
const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB...");

  // Clear
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Table.deleteMany({});

  // Users
  await User.create([
    {
      name: "Admin Quán",
      email: "admin@coffee.com",
      password: "123456",
      role: "admin",
      phone: "0901234567",
      salary: 15000000,
    },
    {
      name: "Trần Thị B",
      email: "barista@coffee.com",
      password: "123456",
      role: "barista",
      phone: "0923456789",
      salary: 8000000,
      shift: "morning",
    },
    {
      name: "Lê Văn C",
      email: "waiter@coffee.com",
      password: "123456",
      role: "waiter",
      phone: "0934567890",
      salary: 7000000,
      shift: "afternoon",
    },
  ]);
  console.log("✅ Users seeded");

  // Categories
  const cats = await Category.create([
    { name: "Cà Phê", icon: "☕", sortOrder: 1 },
    { name: "Trà & Trà Sữa", icon: "🍵", sortOrder: 2 },
    { name: "Sinh Tố", icon: "🥤", sortOrder: 3 },
    { name: "Bánh & Snack", icon: "🍰", sortOrder: 4 },
    { name: "Nước Ép", icon: "🍊", sortOrder: 5 },
  ]);
  console.log("✅ Categories seeded");

  const [cf, tea, sm, cake, juice] = cats;

  // Products - 10 dishes each category with images
  const products = await Product.create([
    {
      name: "Cà Phê Đen",
      category: cf._id,
      price: 25000,
      description: "Cà phê đen truyền thống",
      isAvailable: true,
      isFeatured: true,
      preparationTime: 3,
    },
    {
      name: "Cà Phê Sữa",
      category: cf._id,
      price: 30000,
      description: "Cà phê đen pha sữa đặc",
      isAvailable: true,
      isFeatured: true,
      preparationTime: 3,
    },
    {
      name: "Bạc Xỉu",
      category: cf._id,
      price: 32000,
      description: "Ít cà phê nhiều sữa",
      isAvailable: true,
      preparationTime: 3,
    },
    {
      name: "Cappuccino",
      category: cf._id,
      price: 55000,
      description: "Espresso với sữa bọt mịn",
      isAvailable: true,
      isFeatured: true,
      preparationTime: 5,
    },
    {
      name: "Latte",
      category: cf._id,
      price: 52000,
      description: "Espresso với sữa nóng mịn màng",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Mocha",
      category: cf._id,
      price: 58000,
      description: "Cà phê sô cô la béo ngậy",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Cà Phê Vani",
      category: cf._id,
      price: 36000,
      description: "Cà phê thơm vani nhẹ nhàng",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Cà Phê Trứng",
      category: cf._id,
      price: 60000,
      description: "Cà phê trứng béo ngậy đậm vị",
      isAvailable: true,
      preparationTime: 6,
    },
    {
      name: "Espresso",
      category: cf._id,
      price: 28000,
      description: "Một shot cà phê đậm đặc",
      isAvailable: true,
      preparationTime: 2,
    },
    {
      name: "Americano",
      category: cf._id,
      price: 30000,
      description: "Espresso pha thêm nước nóng",
      isAvailable: true,
      preparationTime: 3,
    },

    {
      name: "Trà Đào",
      category: tea._id,
      price: 45000,
      description: "Trà xanh với đào thơm ngon",
      isAvailable: true,
      isFeatured: true,
      preparationTime: 4,
    },
    {
      name: "Trà Sữa Truyền Thống",
      category: tea._id,
      price: 40000,
      description: "Trà sữa Hong Kong classic",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Trà Sữa Trân Châu",
      category: tea._id,
      price: 52000,
      description: "Trà sữa với trân châu dai",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Trà Matcha",
      category: tea._id,
      price: 47000,
      description: "Trà xanh matcha đậm đà",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Trà Oolong",
      category: tea._id,
      price: 42000,
      description: "Trà Ô long thanh mát",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Trà Sen",
      category: tea._id,
      price: 48000,
      description: "Trà sen thơm dịu nhẹ",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Trà Vải",
      category: tea._id,
      price: 45000,
      description: "Trà vải thơm ngọt thanh",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Trà Chanh Đào",
      category: tea._id,
      price: 43000,
      description: "Trà chanh đào tươi mát",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Trà Sữa Bạc Hà",
      category: tea._id,
      price: 47000,
      description: "Trà sữa với bạc hà sảng khoái",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Trà Đen Truyền Thống",
      category: tea._id,
      price: 38000,
      description: "Trà đen truyền thống thơm nồng",
      isAvailable: true,
      preparationTime: 3,
    },

    {
      name: "Sinh Tố Bơ",
      category: sm._id,
      price: 55000,
      description: "Bơ Đắk Lắk tươi xanh",
      isAvailable: true,
      isFeatured: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Dâu",
      category: sm._id,
      price: 50000,
      description: "Dâu tươi xay nhuyễn",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Xoài",
      category: sm._id,
      price: 52000,
      description: "Xoài chín thơm mát",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Sapoche",
      category: sm._id,
      price: 54000,
      description: "Sapoche ngọt thanh béo mịn",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Cacao",
      category: sm._id,
      price: 53000,
      description: "Sinh tố cacao đậm vị",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Kiwi",
      category: sm._id,
      price: 52000,
      description: "Kiwi tươi chua ngọt",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Bơ Hạnh Nhân",
      category: sm._id,
      price: 58000,
      description: "Bơ kết hợp hạnh nhân thơm béo",
      isAvailable: true,
      preparationTime: 6,
    },
    {
      name: "Sinh Tố Táo",
      category: sm._id,
      price: 50000,
      description: "Táo tươi mát lạnh",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Chanh Dây",
      category: sm._id,
      price: 54000,
      description: "Chanh dây thơm chua ngọt",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Sinh Tố Dứa",
      category: sm._id,
      price: 52000,
      description: "Dứa chua ngọt sảng khoái",
      isAvailable: true,
      preparationTime: 5,
    },

    {
      name: "Bánh Croissant",
      category: cake._id,
      price: 35000,
      description: "Bánh sừng bò bơ Pháp",
      isAvailable: true,
      preparationTime: 2,
    },
    {
      name: "Bánh Muffin Chocolate",
      category: cake._id,
      price: 40000,
      description: "Muffin chocolate mềm xốp",
      isAvailable: true,
      preparationTime: 3,
    },
    {
      name: "Bánh Mousse Chanh Dây",
      category: cake._id,
      price: 52000,
      description: "Mousse chanh dây mịn lạnh",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Bánh Flan",
      category: cake._id,
      price: 30000,
      description: "Bánh flan thơm trứng sữa",
      isAvailable: true,
      preparationTime: 3,
    },
    {
      name: "Bánh Tart Trái Cây",
      category: cake._id,
      price: 52000,
      description: "Tart trái cây tươi ngon",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Bánh Brownie",
      category: cake._id,
      price: 45000,
      description: "Brownie sô cô la đậm đặc",
      isAvailable: true,
      preparationTime: 3,
    },
    {
      name: "Bánh Cheese Cake",
      category: cake._id,
      price: 55000,
      description: "Cheesecake mịn béo",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Bánh Panna Cotta",
      category: cake._id,
      price: 50000,
      description: "Panna cotta kem dẻo mịn",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Bánh Cookies Socola",
      category: cake._id,
      price: 32000,
      description: "Cookies giòn tan socola",
      isAvailable: true,
      preparationTime: 2,
    },
    {
      name: "Bánh Quế",
      category: cake._id,
      price: 28000,
      description: "Bánh quế giòn thơm mùi bơ",
      isAvailable: true,
      preparationTime: 2,
    },

    {
      name: "Nước Ép Cam",
      category: juice._id,
      price: 40000,
      description: "Cam vắt tươi",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Nước Ép Cà Rốt",
      category: juice._id,
      price: 42000,
      description: "Cà rốt tươi giàu vitamin",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Nước Ép Táo",
      category: juice._id,
      price: 42000,
      description: "Táo mật mát lành",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Nước Ép Dứa",
      category: juice._id,
      price: 43000,
      description: "Dứa chua ngọt tươi mát",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Nước Ép Chanh Dây",
      category: juice._id,
      price: 45000,
      description: "Chanh dây thơm chua ngọt",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Nước Ép Ổi",
      category: juice._id,
      price: 42000,
      description: "Ổi xanh tươi ngon",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Nước Ép Dưa Hấu",
      category: juice._id,
      price: 43000,
      description: "Dưa hấu mát lành",
      isAvailable: true,
      preparationTime: 4,
    },
    {
      name: "Nước Ép Lựu",
      category: juice._id,
      price: 47000,
      description: "Lựu đỏ ngọt thanh",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Nước Ép Kiwi",
      category: juice._id,
      price: 46000,
      description: "Kiwi chua ngọt tươi mát",
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: "Nước Ép Chanh Leo",
      category: juice._id,
      price: 45000,
      description: "Chanh leo dễ uống",
      isAvailable: true,
      preparationTime: 5,
    },
  ]);

  // Create image files using product IDs - with visible placeholder
  const imgDir = path.join(__dirname, "../public/images/products");
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }
  
  // Generate a simple PNG placeholder (200x200 beige/tan color)
  for (const product of products) {
    const filename = `${product._id}.png`;
    const imagePath = path.join(imgDir, filename);
    
    // Create a 200x200 PNG - beige color for coffee theme
    // Base64 of a proper 200x200 PNG with tan/beige color
    const placeholderBase64 = "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAD+NJREFUeF7t3cFu2zAMhmFRWIYdMRyzIj1sB6wnbBhsKI4rLhxsSzCMHVAU7yh5hCQycJDRKFGiRFJi1c+8IBDFeUkFkrRkU5Ze67Tpua7bvu/7ruu6/M/1ej1/Pp/NxWIxmw+Hwy+VSmU+Go0+V6vVz7e3t++Ox+PLy/H4/Bl4//39jb+/f7Hf72MymfBzGo+HAMAwDC4uLtCvGo0GhkMh5NfW1ohhlpeXv5ydnZ2dxWIxvtRsNmM+q9XqfLFYYDQafVFV9dPpdDIxTfO0Xq9/qKpKkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiTpz1QqFXzzBVdWVr5ksRRFmbS7HQ6HfC0BKpVKPp/PGQ8GA8znbrcbgsEgwxEMBhGsVCqpVMqZTCaRTC7wv7JymtXVVbxhGAzGw+EQb1gslsRh2O12GMYZ+xaLBYPxdDqlsXg8ZjAMw2AwnE6nmsxgmqb0go+fwxfNZpPBMAxDTaYEXqfTwe9wOBxqMt1uN34nYDabqcoEhqEwTVMZpJJsNhs6hYqiqqogCzZNQ+fwer0qKoMoioLXweu2268AHsSwpxN4PB4VGb+fzysrK0SpIWw2G7q/w4TAj1yt9KqZwel0UqI8KUYzDEOrv7i0efRc3e12+K3pdIq/VRSFIgGpqhLMYrGQRWIyGo1wU+j+DEQAcTqdKjIAQ7+3SvLm94MBiqIowSyXS0tH7Pv7O1yS7+9vKJJCozVaTCYT8aMlsD1uKMaIlk72UpxW3xNfKnpz+zn0bpV4bNBVMr5Fz5bI7nqA1sxjqSn1BqH1vRjlTW1Zr5UqvVf4bXCHjHiKA2LgFyNPeBlEBAMq4Bci0AgLxfXbkGAED+LD5YXQMAIBGsJEQlkC0AAVAC2QIAD0Q1GAA85IVNwg3+8wNdMdQQtgbZjJSP0qHc2P8FMmK1vOMHPYVkzEPcLPqeB6JuVTYl8L86LwGQveFBB6F04dxmVH9dDcvbXQqF3LJ32HU/XZM4VfwvyoEPJ/YGF5xXlPFYawdEhxNGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxRFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxRFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVRcAlMGSDFUXAJTBkgxVFwCUwZIMVR/PdtNn4CAAD//2QBXw==";
    const placeholderBuffer = Buffer.from(placeholderBase64, 'base64');
    
    fs.writeFileSync(imagePath, placeholderBuffer);

    // Update product with image filename
    await Product.findByIdAndUpdate(product._id, {
      image: filename,
    });
  }

  console.log("✅ Products seeded with images");

  // Tables
  const tableData = [];
  for (let i = 1; i <= 8; i++)
    tableData.push({ number: i, capacity: 4, zone: "indoor" });
  for (let i = 9; i <= 12; i++)
    tableData.push({ number: i, capacity: 2, zone: "outdoor" });
  tableData.push({ number: 13, name: "Bàn VIP 1", capacity: 6, zone: "vip" });
  tableData.push({ number: 14, name: "Bàn VIP 2", capacity: 8, zone: "vip" });
  tableData.push({ number: 15, name: "Quầy Bar", capacity: 4, zone: "bar" });
  await Table.create(tableData);
  console.log("✅ Tables seeded");

  console.log("\n🎉 Seed completed!");
  console.log("📧 Login: admin@coffee.com / 123456");
  console.log("📧 Barista: barista@coffee.com / 123456");
  console.log("📧 Waiter: waiter@coffee.com / 123456");
};

// Export seed function
module.exports = seed;

// Run seed if called directly
if (require.main === module) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  }).then(() => {
    process.exit(0);
  });
}
