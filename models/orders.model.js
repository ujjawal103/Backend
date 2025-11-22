const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. Full, Half
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, default: 0 } // quantity * price
});

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  itemName: { type: String, required: true },
  variants: [variantSchema],
  totalItemPrice: { type: Number, default: 0 } // sum of all variant totals
});

const orderSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
    username: { type: String, trim: true, default: "Guest" },
    items: [itemSchema],

    // ✅ Billing details
    gstApplicable: { type: Boolean, default: false },
    restaurantChargeApplicable: { type: Boolean, default: false },
    gstRate: { type: Number, default: 0 },
    restaurantCharge: { type: Number, default: 0 },

    // ✅ Extra fields for tracking and UI
    gstAmount: { type: Number, default: 0 },
    restaurantChargeAmount: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "served",
        "completed",
        "cancelled"
      ],
      default: "pending"
    },
   
    isSynced: { type: Boolean, default: false },
    source: { type: String, enum: ["online", "offline-sync"], default: "online" }
  },
  { timestamps: true }
);

// 🧮 Auto-calculate totals before save
// orderSchema.pre("save", function (next) {
//   const order = this;

//   // Step 1: Calculate totals for variants and items
//   order.items.forEach(item => {
//     item.variants.forEach(variant => {
//       variant.total = variant.quantity * variant.price;
//     });
//     item.totalItemPrice = item.variants.reduce((sum, v) => sum + v.total, 0);
//   });

//   // Step 2: Calculate subtotal
//   const subtotal = order.items.reduce((sum, i) => sum + i.totalItemPrice, 0);
//   order.subTotal = subtotal;

//   // Step 3: Calculate GST and restaurant charge
//   order.gstAmount = order.gstApplicable ? subtotal * order.gstRate : 0;
//   order.restaurantChargeAmount = 0;

//   if (order.restaurantChargeApplicable) {
//     order.restaurantChargeAmount =
//       order.restaurantCharge > 1
//         ? order.restaurantCharge
//         : subtotal * order.restaurantCharge;
//   }

//   // Step 4: Final total
//   order.totalAmount = subtotal + order.gstAmount + order.restaurantChargeAmount;

//   next();
// });

module.exports = mongoose.model("Order", orderSchema);
