const { validationResult } = require("express-validator");
const Item = require("../models/items.model");
const Order = require("../models/orders.model");
const Store = require("../models/restronStore.model");
const Table = require("../models/tables.model");
const { sendMessageToSocket } = require("../socket");
const sendPushNotification = require("../utils/sendPushNotification");

exports.createOrder = async (req, res) => {
  try {
    // 🧩 Step 1: Validate request input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, tableId,username, items } = req.body;

    // 🏪 Step 2: Fetch store settings (GST & restaurant charge)
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const table = await Table.findOne({ _id: tableId, store});
    if (!table) {
      return res.status(404).json({ message: "Table not for booking" });
    }

    const gstApplicable = store.gstSettings?.gstApplicable || false;
    const restaurantChargeApplicable = store.gstSettings?.restaurantChargeApplicable || false;
    const gstRate = store.gstSettings?.gstRate || 0;
    const restaurantCharge = store.gstSettings?.restaurantCharge || 0;

    // 🧠 Step 3: Validate all items and variants
    let totalServerPrice = 0;

    for (const orderItem of items) {
    const item = await Item.findOne({
      _id: orderItem.itemId,
      storeId,
      itemName: { $regex: new RegExp(`^${orderItem.itemName}$`, "i") }
    });

      if (!item || !item.available) {
        return res.status(400).json({
          message: `Item '${orderItem.itemName || orderItem.itemId}' is not available or doesn't exist.`,
        });
      }

      // 🔍 Validate variants
      for (const variant of orderItem.variants) {
        const existingVariant = item.variants.find(
          (v) => v.name.toLowerCase() === variant.type.toLowerCase()
        );

        if (!existingVariant) {
          return res.status(400).json({
            message: `Variant '${variant.type}' is not available for '${item.itemName}'.`,
          });
        }

        // ⚔️ Price verification (anti-tampering)
        if (variant.price !== existingVariant.price) {
          return res.status(403).json({
            message: "Autonomous behavior detected: Price mismatch detected.",
          });
        }

        // 💰 Add total variant price (for server validation)
        totalServerPrice += existingVariant.price * variant.quantity;
      }
    }

    // 🧮 Step 4: Apply GST & restaurant charge (based on store settings)
    let gstAmount = gstApplicable ? totalServerPrice * gstRate : 0;
    let restaurantChargeAmount = 0;

    if (restaurantChargeApplicable) {
      restaurantChargeAmount =
        restaurantCharge > 1 ? restaurantCharge : totalServerPrice * restaurantCharge;
    }

    const finalTotal = totalServerPrice + gstAmount + restaurantChargeAmount;

    // ✅ Step 5: Create and save the order
    const order = new Order({
      storeId,
      tableId,
      username,
      items,
      gstApplicable,
      restaurantChargeApplicable,
      gstRate,
      restaurantCharge,
      totalAmount: finalTotal, // will also be recalculated in pre-save
    });

    await order.save();

    if (store.fcmTokens && store.fcmTokens.length > 0) {
      await sendPushNotification(
        store.fcmTokens,
        "New Order Received!",
        `New order from Table ${table.tableNumber} totaling ₹${finalTotal.toFixed(2)}`
      );
    }

    
    const storeSocketId = store.socketId;
    if (storeSocketId) {
      sendMessageToSocket(storeSocketId, {
        event: "new-order",
        data: order
      });
      
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Error in createOrder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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



