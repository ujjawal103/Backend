const QRCode = require("qrcode");
const cloudUpload = require("../utils/helper.cloudHandle");
const Table = require("../models/tables.model");
const Store = require("../models/restronStore.model");
const { validationResult } = require('express-validator');

// exports.addTable = async (req, res) => {
//   try {
//     const storeId = req.store._id;

//     // Find store
//     const store = await Store.findById(storeId);
//     if (!store) return res.status(404).json({ message: "Store not found" });

//      // ✅ Auto increment table number
//     const lastTable = await Table.findOne({ store: storeId }).sort({ tableNumber: -1 });
//     const tableNumber = lastTable ? lastTable.tableNumber + 1 : 1;

//     // QR data
//     const qrData = JSON.stringify({
//       tableNumber: tableNumber,
//       storeId: store._id,
//       storeName: store.storeName,
//     });
//     const qrBuffer = await QRCode.toBuffer(qrData);

//     // Upload QR to Cloudinary
//     const uploadResult = await cloudUpload.cloudUpload(qrBuffer, "restaurant/tables");

//     // Create table entry
//     const table = await Table.create({
//       store: store._id,
//       tableNumber,
//       qrCode: uploadResult.secure_url,
//       qrPublicId: uploadResult.public_id
//     });

//     // Add table reference in store
//     store.tables.push(table._id);
//     await store.save();

//     res.status(201).json({ message: "Table created", table });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



exports.addTable = async (req, res) => {
  try {
    const storeId = req.store._id;

    // Find store
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    // ✅ Auto increment table number
    const lastTable = await Table.findOne({ store: storeId }).sort({ tableNumber: -1 });
    const tableNumber = lastTable ? lastTable.tableNumber + 1 : 1;

    // ⚡️ Pehle table create karo taaki _id mil jaye
    const table = new Table({
      store: store._id,
      tableNumber,
      isOccupied: false,
    });

    // ✅ Ab ek URL banaye jo scan hote hi frontend order page open kare
    const qrUrl = `${process.env.CLIENT_URL}/order/${store._id}/${table._id}`;

    // QR Generate
    const qrBuffer = await QRCode.toBuffer(qrUrl);

    // Upload QR to Cloudinary
    const uploadResult = await cloudUpload.cloudUpload(qrBuffer, "restaurant/tables");

    // Update table with QR details
    table.qrCode = uploadResult.secure_url;
    table.qrPublicId = uploadResult.public_id;
    await table.save();

    // Add table reference in store
    store.tables.push(table._id);
    await store.save();

    res.status(201).json({ message: "Table created", table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.editTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { newTableNumber } = req.body;
    const storeId = req.store._id;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (!newTableNumber) {
      return res.status(400).json({ message: "New table number is required" });
    }

    // Find table
    const table = await Table.findOne({ _id: tableId, store: storeId });
    if (!table) return res.status(404).json({ message: "Table not found" });

    // ✅ Ensure uniqueness
    const existingTable = await Table.findOne({
      store: storeId,
      tableNumber: newTableNumber,
      _id: { $ne: tableId }
    });
    if (existingTable) {
      return res.status(400).json({ message: "Table number already exists in this store" });
    }

    // ✅ Just update the table number
    table.tableNumber = newTableNumber;
    await table.save();

    res.json({ message: "Table number updated successfully", table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.removeTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const storeId = req.store._id;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // ✅ Delete QR from Cloudinary using public_id
    if (table.qrPublicId) {
      await cloudUpload.cloudDelete(table.qrPublicId);
    }

    // Remove from Table collection
    await Table.findByIdAndDelete(tableId);

    // Remove reference from Store
    await Store.findByIdAndUpdate(storeId, { $pull: { tables: tableId } });

    res.json({ message: "Table and QR deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};













exports.getTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const storeId = req.store._id;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // ✅ Find specific table
    const table = await Table.findOne({ _id: tableId, store: storeId });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json({ table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






exports.getAllTables = async (req, res) => {
  try {
    const storeId = req.store._id;

    const tables = await Table.find({ store: storeId }).sort({ tableNumber: 1 });

    res.json({ count: tables.length, tables });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
