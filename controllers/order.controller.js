const { validationResult } = require("express-validator");
const Item = require("../models/items.model");
const Order = require("../models/orders.model");
const Store = require("../models/restronStore.model");
const Table = require("../models/tables.model");
const { sendMessageToSocket } = require("../socket");
const sendPushNotification = require("../utils/sendPushV1");

exports.createOrder = async (req, res) => {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, tableId, username, items, billingSummary } = req.body;

    const store = await Store.findById(storeId);
    const table = await Table.findOne({ _id: tableId, store });

    if (!store || !table) {
      return res.status(404).json({ message: "Store / Table not found" });
    }

    // Save EXACT values from frontend
    const order = new Order({
      storeId,
      tableId,
      username,
      items,
      ...billingSummary,
    });

    await order.save();


    // 🔔 Send push notification
    if (store.fcmTokens?.length > 0) {
      await sendPushNotification(
        store.fcmTokens,
        "New Order Received!",
        `New order from Table ${table.tableNumber} totaling ₹${billingSummary?.totalAmount || 0}`,
        storeId
      );
    }

    // 🔔 Emit socket event
    const storeSocketId = store.socketId;
    if (storeSocketId) {
      sendMessageToSocket(storeSocketId, {
        event: "new-order",
        data: order
      });
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("❌ Error in createOrder:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.syncAllOrders = async (req, res) => {
  try {
    const { storeId, orders } = req.body;

    if (!storeId || !Array.isArray(orders)) {
      return res.status(400).json({ message: "Missing storeId or orders array" });
    }

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    let successCount = 0;
    let failedCount = 0;
    const results = [];

    for (const o of orders) {
      try {
        const { tableId, username, items, billingSummary, createdAt, updatedAt } = o;

        if (!tableId || !items || items.length === 0 || !billingSummary) {
          results.push({ ok: false, orderRef: o._localId });
          failedCount++;
          continue;
        }

        const table = await Table.findOne({ _id: tableId, store: storeId });
        if (!table) {
          results.push({ ok: false, orderRef: o._localId });
          failedCount++;
          continue;
        }

        // 🟢 Save EXACTLY as frontend created
        const orderDoc = new Order({
          storeId,
          tableId,
          username: username || "Guest",
          items,
          ...billingSummary,
          source: "offline-sync",
          isSynced: true,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        });

        await orderDoc.save();

        results.push({ ok: true, orderId: orderDoc._id, orderRef: o._localId });
        successCount++;

      } catch (e) {
        console.log("Sync error for one order:", e);
        results.push({ ok: false, orderRef: o._localId });
        failedCount++;
      }
    }

    const total = successCount + failedCount;

    if (total > 0 && store.fcmTokens.length > 0) {
      await sendPushNotification(
        store.fcmTokens,
        "Offline Sync Report",
        `${successCount} orders synced, ${failedCount} failed.`,
        storeId
      );
    }

    return res.json({
      success: true,
      summary: { successCount, failedCount, total },
      results,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during sync" });
  }
};




// ✅ Get all orders for a store (Store Dashboard)
exports.getStoreOrders = async (req, res) => {
  try {
    const storeId = req.store._id; // from authStore middleware
    const orders = await Order.find({ storeId })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error in getStoreOrders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get orders for a particular table (for waiter view)
exports.getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    const storeId = req.store._id;

    const orders = await Order.find({ storeId, tableId }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this table" });
    }

    res.status(200).json({
      message: "Table orders fetched successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error in getTableOrders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update order status (Store only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const storeId = req.store._id;

    const order = await Order.findOne({ _id: orderId, storeId });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: `Order status updated to '${status}'`,
      order,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get single order details (for store)
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("storeId", "storeName storeDetails.address storeDetails.phoneNumber storeDetails.photo")
      .populate("tableId", "tableNumber");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order details fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Cancel order (Customer)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const storeId = req.store._id; // from authCustomer middleware

    const order = await Order.findOne({ _id: orderId, storeId });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already '${order.status}'`,
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






// ✅ Get orders for a selected date (Store Dashboard)
exports.getOrdersByDate = async (req, res) => {
  try {
    const storeId = req.store._id;
    const { date } = req.query; // expected format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required (YYYY-MM-DD)" });
    }

    // Create date range for full day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // ✅ Force to 12:00 AM (start of day)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      storeId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Orders for ${date} fetched successfully`,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error in getOrdersByDate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get orders by selected status (Store Dashboard)
exports.getOrdersByStatus = async (req, res) => {
  try {
    const storeId = req.store._id;
    const { status } = req.query; // example: ?status=completed

    const validStatuses = ["pending", "confirmed", "preparing", "served", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const orders = await Order.find({ storeId, status })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Orders with status '${status}' fetched successfully`,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error in getOrdersByStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getOrdersByMonth = async (req, res) => {
  try {
    const storeId = req.store._id;
    const { month, year } = req.query; // expected format: month=11&year=2025

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Month and year query parameters are required" });
    }

    // Get first and last date of the given month
    const startOfMonth = new Date(year, month - 1, 1); // month is 0-indexed in JS
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const orders = await Order.find({
      storeId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Orders for ${month}-${year} fetched successfully`,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error in getOrdersByMonth:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



