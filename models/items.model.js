const mongoose = require("mongoose");

const schema = mongoose.Schema;

const itemSchema = new schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  itemName: {
    type: String,
    required: true,
    minLength: [2, "Item name should be atleast 2 characters"]
  },
  description: {
    type: String,
    default: ""
  },
//   price: {
//     type: Number,
//     required: true,
//     min: [1, "Price should be atleast 1"]
//   },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: "/default-item.png"
  },
  imagePublicId: {
    type: String
  },

  // ✅ Variants for customisation (e.g. Small/Medium/Large)
  variants: [
    {
      name: { type: String, required: true },   // e.g. Small / Medium / Large
      price: { type: Number, required: true, min: [1, "Price should be atleast 1"] },   // e.g. 100, 150, 200
      available: { type: Boolean, default: true } // Variant availability
    }
  ]
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
