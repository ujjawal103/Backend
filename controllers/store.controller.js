const storeModel = require('../models/restronStore.model');
const { validationResult } = require('express-validator');
const StoreServices = require("../services/store.service.js");
const blacklistToken = require('../models/blacklistToken.model');
const adminModel = require('../models/admin.model.js');


module.exports.registerStore = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeName, email, password, storeDetails ,gstSettings} = req.body;
    const admin = await adminModel.findById(req.admin._id);
    
    if (!admin) {
      return res.status(401).json({ message: "You Can't create a store" });
    }

    const isStoreExists = await storeModel.findOne({ email });
    if (isStoreExists) {
      return res.status(400).json({ message: "Store already exists" });
    }

    const hashedPassword = await storeModel.hashedPassword(password);

    // ✅ First create the store
    const store = await StoreServices.createStore({
      storeName,
      email,
      password: hashedPassword,
      photo: storeDetails.photo,
      address: storeDetails.address,
      phoneNumber: storeDetails.phoneNumber,
      gstApplicable: gstSettings.gstApplicable,
      gstRate: gstSettings.gstRate,
      restaurantChargeApplicable: gstSettings.restaurantChargeApplicable,
      restaurantCharge: gstSettings.restaurantCharge
    });

    admin.stores?.push(store._id);
    await admin.save();

    const token = store.generateAuthToken();

    res.status(201).json({ token, store });
  } catch (error) {
    console.error("❌ Error in registerStore:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports.loginStore = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const store = await storeModel.findOne({ email }).select("+password");
    if(!store) {
        return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const isMatchPassword = await store.comparePassword(password);
    if(!isMatchPassword) {
        return res.status(401).json({ message: "Invalid Email or Password" });
    }

    store.status = "open";
    await store.save();

    const token = store.generateAuthToken();
    res.cookie("token", token);
    res.status(200).json({ token, store });
}



module.exports.getStoreProfile = async (req, res, next) => {
    res.status(200).json({ store: req.store });
}



module.exports.logoutStore = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    const store = await storeModel.findById(req.store._id);
    if (!store) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    store.status = "closed";
    await store.save();

    if(!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    // Add token to blacklist
    await blacklistToken.create({ token });
    
    res.clearCookie("token");
    res.status(200).json({ message: "Store logged out successfully" });
}




module.exports.updateStoreCharges = async (req, res, next) => {
  try {
    console.log("Updating store charges with data:", req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { gstApplicable, gstRate, restaurantChargeApplicable, restaurantCharge } = req.body;
    console.log("Updating store charges with data:", req.body);

    const store = await storeModel.findById(req.store._id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Update only provided fields
    if (gstApplicable !== undefined) store.gstSettings.gstApplicable = gstApplicable;
    if (gstRate !== undefined) store.gstSettings.gstRate = gstRate;
    if (restaurantChargeApplicable !== undefined) store.gstSettings.restaurantChargeApplicable = restaurantChargeApplicable;
    if (restaurantCharge !== undefined) store.gstSettings.restaurantCharge = restaurantCharge;

    await store.save();

    res.status(200).json({
      message: "Charges updated successfully",
      gstSettings: store.gstSettings
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update store charge settings",
      error: error.message
    });
  }
};


module.exports.updateStorePhoto = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { photo } = req.body;

        const store = await storeModel.findById(req.store._id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        store.storeDetails.photo = photo;
        await store.save();

        res.status(200).json({
            message: "Store photo updated successfully",
            store
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update store photo",
            error: error.message
        });
    }
};



module.exports.updateStoreInfo = async (req, res, next) => {
  try {
    // ✅ Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeName, email, storeDetails } = req.body;

    // ✅ Find the store using the auth middleware’s injected store ID
    const store = await storeModel.findById(req.store._id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // ✅ If user tries to change email, ensure it’s unique
    if (email && email !== store.email) {
      const isEmailExists = await storeModel.findOne({ email });
      if (isEmailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      store.email = email;
    }

    // ✅ Update only provided fields
    if (storeName) store.storeName = storeName;
    if (storeDetails?.address) store.storeDetails.address = storeDetails.address;
    if (storeDetails?.phoneNumber)
      store.storeDetails.phoneNumber = storeDetails.phoneNumber;

    await store.save();

    res.status(200).json({
      message: "Store information updated successfully",
      store,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update store information" });
  }
};









