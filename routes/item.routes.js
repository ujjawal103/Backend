const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const upload = require("../cloudinary/multer.config");
const itemController = require("../controllers/items.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ✅ Add new item (auto creates default "Full" variant)
router.post(
  "/add",
  authMiddleware.authStore,
  [
    body("itemName").notEmpty().withMessage("Item name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
  ],
  itemController.addItem
);



// ✅ Edit item details (not variants)
router.put(
  "/edit/:itemId",
  authMiddleware.authStore,
  [
    param("itemId").isMongoId().withMessage("Invalid Item ID"),
    body("itemName").optional().isString(),
    body("description").optional().isString(),
  ],
  itemController.editItem
);



router.put(
  "/edit/available/:itemId",
  authMiddleware.authStore,
  [
    param("itemId").isMongoId().withMessage("Invalid Item ID"),
    body("available").isBoolean().withMessage("Available must be true or false"),
  ],
  itemController.updateItemAvailability
)

router.put(
  "/upload-image/:itemId",
  authMiddleware.authStore,
  upload.single("image"),
  [param("itemId").isMongoId().withMessage("Invalid Item ID")],
  itemController.uploadItemImage
);


router.delete(
  "/remove/:itemId",
  authMiddleware.authStore,
  [param("itemId").isMongoId().withMessage("Invalid Item ID")],
  itemController.removeItem
);




// ✅ Get all items of a store (only for that store)
router.get(
  "/store-items",
  authMiddleware.authStore,
  itemController.getAllItems
);


// ✅ Get all items (public)
router.get(
  "/menu/:storeId",
  itemController.getAllItems
);




// ✅ Get single item by ID
router.get(
  "/:itemId",
  [param("itemId").isMongoId().withMessage("Invalid Item ID")],
  itemController.getItem
);




















router.post(
  "/addvariant/:itemId",
  authMiddleware.authStore,
  [
    param("itemId").isMongoId().withMessage("Invalid Item ID"),
    body("variantName").notEmpty().withMessage("Variant name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
  ],
  itemController.addVariant
);



router.put(
  "/editvariant/:itemId/:variantId",
  authMiddleware.authStore,
  [
    param("itemId").isMongoId().withMessage("Invalid Item ID"),
    param("variantId").isMongoId().withMessage("Invalid Variant ID"),
    body("variantName").optional().isString(),
    body("price").optional().isNumeric(),
  ],
  itemController.editVariant
);

router.put(
  "/editvariant/available/:itemId/:variantId",
  authMiddleware.authStore,
  [
    param("itemId").isMongoId().withMessage("Invalid Item ID"),
    param("variantId").isMongoId().withMessage("Invalid Variant ID"),
    body("available").isBoolean().withMessage("Available must be true or false"),
  ],
  itemController.updateVariantAvailability
);

// ✅ Remove variant
router.delete(
  "/removevariant/:itemId/:variantId",
  authMiddleware.authStore,
  [
    param("itemId").isMongoId().withMessage("Invalid Item ID"),
    param("variantId").isMongoId().withMessage("Invalid Variant ID"),
  ],
  itemController.removeVariant
);

module.exports = router;
