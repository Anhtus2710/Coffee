const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  size: { type: String, enum: ["S", "M", "L", "default"], default: "default" },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  note: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "preparing", "ready", "served"],
    default: "pending",
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    tableNumber: { type: Number },
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway"],
      default: "dine-in",
    },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "paid",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "momo"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    note: { type: String, default: "" },
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paidAt: { type: Date },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: '' },
  },
  { timestamps: true },
);

// Auto-generate order code
orderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    const count = await mongoose.model("Order").countDocuments();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    this.orderCode = `CS-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
  // Calculate totals
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  this.total = this.subtotal - this.discount + this.tax;
  next();
});

module.exports = mongoose.model("Order", orderSchema);
