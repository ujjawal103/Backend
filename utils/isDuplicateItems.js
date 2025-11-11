// utils/checkDuplicateItem.js
const Item = require("../models/items.model");

exports.isDuplicateItem = async (storeId, itemName) => {
  const existingItem = await Item.findOne({
    storeId,
    itemName: { $regex: new RegExp(`^${itemName}$`, "i") }, // case-insensitive exact match
  });
  return !!existingItem;
};
