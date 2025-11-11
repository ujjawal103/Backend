const Item = require("../models/items.model");
const { validationResult } = require('express-validator');
const { isDuplicateItem } = require("../utils/isDuplicateItems");
const Store = require("../models/restronStore.model");
const cloudUpload = require("../utils/helper.cloudHandle");

exports.addItem = async (req, res) => {
  try {
    const storeId = req.store._id; // from auth middleware
    const { itemName, description, price } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find store
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!itemName || !price) {
      return res.status(400).json({ message: "Item name and price are required" });
    }

    // ✅ Check for duplicate (case-insensitive)
    const duplicate = await isDuplicateItem(storeId, itemName);
    if (duplicate) {
      return res.status(400).json({ message: "Item with this name already exists" });
    }

    // Create item with default "Full" variant
    const newItem = await Item.create({
      storeId,
      itemName,
      description,
      variants: [
        {
          name: "Full",
          price: price
        }
      ]
    });

    // Add item reference in store
    store.items.push(newItem._id);
    await store.save();
    

    res.status(201).json({
      success: true,
      message: "Item created successfully with default variant",
      item: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.editItem = async (req, res) => {
  try {
    // ✅ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { itemName, description } = req.body;
    const storeId = req.store._id;

    // ✅ Find the item by store and ID to ensure store owns it
    const item = await Item.findOne({ _id: itemId, storeId });
    if (!item) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    // ✅ Check duplicate if name is changing
    if (itemName && itemName.toLowerCase() !== item.itemName.toLowerCase()) {
      const duplicate = await isDuplicateItem(storeId, itemName);
      if (duplicate) {
        return res.status(400).json({ message: "Another item with this name already exists" });
      }
      item.itemName = itemName;
    }
    if (description) item.description = description;

    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.updateItemAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { available } = req.body;

    // ✅ Validate boolean input
    if (typeof available !== "boolean") {
      return res.status(400).json({ message: "Available must be true or false" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Update item availability
    item.available = available;

    // ✅ Reflect to all variants
    if (item.variants && item.variants.length > 0) {
      item.variants.forEach((variant) => {
        variant.available = available;
      });
    }

    await item.save();

    res.status(200).json({
      message: `Item and its variants marked as ${available ? "available" : "unavailable"}`,
      item,
    });
  } catch (error) {
    console.error("Error in updateItemAvailability:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// ✅ Upload or Update Item Image
exports.uploadItemImage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // ✅ If item already has an image, delete old one
    if (item.imagePublicId) {
      await cloudUpload.cloudDelete(item.imagePublicId);
    }

    // ✅ Upload new image to Cloudinary
    const uploadResult = await cloudUpload.cloudUpload(req.file.buffer, "restaurant/items");

    // ✅ Save image details to item
    item.image = uploadResult.secure_url;
    item.imagePublicId = uploadResult.public_id;
    await item.save();

    res.status(200).json({ message: "Item image uploaded successfully", item });
  } catch (error) {
    console.error("Upload Item Image Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Remove Item (and delete image)
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const storeId = req.store._id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Delete image from Cloudinary
    if (item.imagePublicId) {
      await cloudUpload.cloudDelete(item.imagePublicId);
    }

    // ✅ Delete from DB
    await Item.findByIdAndDelete(itemId);

    // ✅ Remove from Store’s item list
    await Store.findByIdAndUpdate(storeId, { $pull: { items: itemId } });

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Remove Item Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


























exports.getItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    // const storeId = req.store._id;

    const item = await Item.findOne({ _id: itemId, /* storeId */ });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ item });
  } catch (error) {
    console.error("Error in getItem:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getAllItems = async (req, res) => {
  try {
    const storeId = req.params?.storeId || req.store?._id; // from auth middleware or URL param

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    const store = await Store.findById(storeId).select("-email").select("-items").select("-tables").select("-storeDetails");
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const items = await Item.find({ storeId }).sort({ createdAt: -1 });

    if (!items.length) {
      return res.status(404).json({ message: "No items found for this store" });
    }

    res.status(200).json({
      count: items.length,
      items,
      store,
    });
  } catch (error) {
    console.error("Error in getAllItems:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};















exports.addVariant = async (req, res) => {
  try {
    // ✅ Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params; // item ID passed in URL
    const { variantName, price } = req.body;

    // ✅ Check required fields
    if (!variantName || !price) {
      return res.status(400).json({ message: "Variant name and price are required" });
    }

    // ✅ Find item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Check for duplicate variant (case-insensitive)
    const isDuplicate = item.variants.some(
      (v) => v.name.toLowerCase() === variantName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ message: "Variant with this name already exists" });
    }

    // ✅ Add new variant
    item.variants.push({
      name : variantName,
      price,
    });

    await item.save();

    res.status(201).json({
      message: "Variant added successfully",
      item,
    });
  } catch (error) {
    console.error("Error in addVariant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// ✅ Edit Variant Controller
exports.editVariant = async (req, res) => {
  try {
    // ✅ Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, variantId } = req.params;
    const { variantName, price } = req.body;

    // ✅ Find item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Find variant
    const variant = item.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // ✅ Check for duplicate variant name (if name changed)
    if (variantName && variantName.toLowerCase() !== variant.name.toLowerCase()) {
      const isDuplicate = item.variants.some(
        (v) =>
          v._id.toString() !== variantId &&
          v.name.toLowerCase() === variantName.toLowerCase()
      );
      if (isDuplicate) {
        return res.status(400).json({ message: "Variant with this name already exists" });
      }
    }

    // ✅ Update fields
    if (variantName) variant.name = variantName;
    if (price !== undefined) variant.price = price;

    await item.save();

    res.status(200).json({
      message: "Variant updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error in editVariant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.updateVariantAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, variantId } = req.params;
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({ message: "Available must be true or false" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const variant = item.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // ✅ Add available field if missing in schema
    variant.available = available;
    await item.save();

    res.status(200).json({
      message: `Variant marked as ${available ? "available" : "unavailable"}`,
      variant,
    });
  } catch (error) {
    console.error("Error in updateVariantAvailability:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




exports.removeVariant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, variantId } = req.params;

    // ✅ Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Block deletion if only one variant exists
    if (item.variants.length === 1) {
      return res
        .status(400)
        .json({ message: "Cannot remove the only remaining variant" });
    }

    // ✅ Check if variant exists
    const variantIndex = item.variants.findIndex(
      (v) => v._id.toString() === variantId
    );
    if (variantIndex === -1) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // ✅ Remove the variant
    item.variants.splice(variantIndex, 1);

    await item.save();

    res.status(200).json({
      message: "Variant removed successfully",
      item,
    });
  } catch (error) {
    console.error("Error in removeVariant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



