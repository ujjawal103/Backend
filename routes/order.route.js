const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

// ✅ Create new order (from checkout)
router.post(
  "/create",
  [
    body("storeId").isMongoId().withMessage("Invalid Store ID"),
    body("tableId").isMongoId().withMessage("Invalid Table ID"),
    body("username").optional().isString(),
    body("items").isArray({ min: 1 }).withMessage("Items are required"),
    body("billingSummary").isObject().withMessage("Billing summary is required"),
  ],
  orderController.createOrder
);

router.post(
  "/sync-orders",
  [
    body("storeId").isMongoId().withMessage("Invalid Store ID"),
    body("orders").isArray().withMessage("Orders array is required"),
  ],
  orderController.syncAllOrders
);

// ✅ Get all orders for a store (Store Dashboard)
router.get(
  "/store-orders",
  authMiddleware.authStore,
  orderController.getStoreOrders
);

// ✅ Get orders for a particular table (for waiter view)
router.get(
  "/table/:tableId",
  [
    param("tableId").isMongoId().withMessage("Invalid Table ID"),
  ],
  authMiddleware.authStore,
  orderController.getTableOrders
);

// ✅ Update order status (Store only)
router.put(
  "/status/:orderId",
  authMiddleware.authStore,
  [
    param("orderId").isMongoId().withMessage("Invalid Order ID"),
    body("status")
      .isIn(["pending", "confirmed", "preparing", "served", "completed"])
      .withMessage("Invalid status value"),
  ],
  orderController.updateOrderStatus
);

// ✅ Get single order details (for store)
router.get(
  "/:orderId",
  authMiddleware.authStore,
  [param("orderId").isMongoId().withMessage("Invalid Order ID")],
  orderController.getOrderDetails
);

//✅ Cancel order (Customer)
router.put(
  "/cancel/:orderId",
  authMiddleware.authStore,
  [param("orderId").isMongoId().withMessage("Invalid Order ID")],
  orderController.cancelOrder
);




// ✅ Orders for a selected date
router.get(
  "/store-orders/date",
  authMiddleware.authStore,
  orderController.getOrdersByDate
);


router.get(
  "/store-orders/month",
  authMiddleware.authStore,
  orderController.getOrdersByMonth
);

// ✅ Orders filtered by status
router.get(
  "/store-orders/status",
  authMiddleware.authStore,
  orderController.getOrdersByStatus
);


module.exports = router;
