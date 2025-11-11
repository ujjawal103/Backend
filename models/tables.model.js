const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  qrCode: {
    type: String, // QR code url ya text
    
  },
  qrPublicId: {
    type: String, // Cloudinary public_id (needed for deletion)
    
  },
  isOccupied: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Table = mongoose.model("Table", tableSchema);

module.exports = Table;
