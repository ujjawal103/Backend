const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const schema = mongoose.Schema;

const storeOwnerSchema = new schema({
    storeName: {
        type: String,
        required: true,
        minLength: [3, "Store name should be atleast 3 characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false,
        minLength: [6, 'Password should be at least 6 characters long']
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'closed'
    },

    // ✅ Store Details
    storeDetails: {
        photo: {
            type: String,
            default: "/store.png"
        },
        address: {
            type: String,
            required: true,
            minLength: [15, "Address should be atleast 15 characters"]
        },
        phoneNumber: {
            type: String,
            match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
        }
    },


    gstSettings: {
    gstApplicable: { type: Boolean, default: false },
    gstRate: { type: Number, default: 0.05 },
    restaurantChargeApplicable: { type: Boolean, default: false },
    restaurantCharge: { type: Number, default: 0 }
    },

    socketId: {
        type: String,
        default: null
    },


    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        }
    ],
    tables: [
        {
            type: mongoose.Schema.Types.ObjectId,
             ref: "Table"
        }
    ]

}, { timestamps: true });


// ---------- methods ----------
storeOwnerSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

storeOwnerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

storeOwnerSchema.statics.hashedPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const Store = mongoose.model("Store", storeOwnerSchema);

module.exports = Store;
