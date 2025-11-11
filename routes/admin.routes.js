const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

//route with validation
router.post("/register",
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("fullName.firstName").isLength({ min : 3 }).withMessage("First Name should be of at least 3 characters"),
        body("password").isLength({min : 6}).withMessage("Password should be of at least 6 characters")
    ],
    adminController.registerAdmin
)



//route with validation
router.post("/login",
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("password").isLength({min : 6}).withMessage("Password should be of at least 6 characters")
    ],
    adminController.loginAdmin
)


router.get("/profile" ,authMiddleware.authSuperAdmin , adminController.getAdminProfile);
router.get("/logout" , authMiddleware.authSuperAdmin , adminController.logoutAdmin);



module.exports = router;