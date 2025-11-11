const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const tableController = require("../controllers/table.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ✅ Add new table
router.post(
  "/add",
  authMiddleware.authStore,
  tableController.addTable
);

// ✅ Edit table number (and regenerate QR)
router.put(
  "/edit/:tableId",
  authMiddleware.authStore,
  [
    param("tableId").isMongoId().withMessage("Invalid Table ID"),
    body("newTableNumber").isNumeric().withMessage("Table number must be numeric"),
  ],
  tableController.editTable
);

// ✅ Remove table
router.delete(
  "/remove/:tableId",
  authMiddleware.authStore,
  [param("tableId").isMongoId().withMessage("Invalid Table ID")],
  tableController.removeTable
);

// ✅ Get all tables for a store
router.get(
  "/:tableId",
  authMiddleware.authStore,
    [param("tableId").isMongoId().withMessage("Invalid Table ID")],
  tableController.getTable
);



// Get all tables
router.get("/", 
    authMiddleware.authStore,
    tableController.getAllTables
);

module.exports = router;
