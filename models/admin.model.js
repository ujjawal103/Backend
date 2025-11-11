const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  fullName: {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "First name should be at least 3 characters"]
    },
    lastName: {
      type: String,
      minLength: [3, "Last name should be at least 3 characters"]
    }
  },

  email: {
    type: String,
    required: true,
    unique: true,
    minLength: [5, "Email should be at least 5 characters"]
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  // ✅ for real-time dashboard if needed
  socketId: {
    type: String
  },

  // ✅ Admin ka role: superadmin / subadmin
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    default: "superadmin"
  },

  // ✅ stores managed by this admin
  stores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store"
    }
  ],

  // ✅ track created date
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// JWT generate
adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

// compare password
adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// hash password
adminSchema.statics.hashedPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;
