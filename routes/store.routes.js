const storeController = require('../controllers/store.controller');
const express = require('express');
const router = express.Router();
const {body , query , param} = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');

// Pilot registration route
router.post('/register',
    authMiddleware.authSuperAdmin,
    [
    body('storeName').notEmpty().isLength({ min: 3 }).withMessage('Store name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 characters long'),
    body('storeDetails.address').notEmpty().isLength({ min : 15}).withMessage('Address should be at least 15 character long'),
    body('storeDetails.phoneNumber').isNumeric().isLength({min : 10 , max : 10}).withMessage("phone number is not valid"),
    body('gstSettings.gstApplicable').isBoolean().withMessage('GST Applicable must be a boolean'),
    body('gstSettings.gstRate').custom((value, { req }) => {
        if (req.body.gstSettings.gstApplicable && (value === null || value === undefined)) {
            throw new Error('GST Rate is required when GST is applicable');
        }
        if (value !== null && value !== undefined && value < 0) {
            throw new Error('GST Rate must be a positive number');
        }
        return true;
    }),
    body('gstSettings.restaurantChargeApplicable').isBoolean().withMessage('Restaurant Charge Applicable must be a boolean'),
    body('gstSettings.restaurantCharge').custom((value, { req }) => {
        if (req.body.gstSettings.restaurantChargeApplicable && (value === null || value === undefined)) {
            throw new Error('Restaurant Charge is required when applicable');
        }
        if (value !== null && value !== undefined && value < 0) {
            throw new Error('Restaurant Charge must be a positive number');
        }
        return true;
    }),
    ],
    storeController.registerStore
);

router.post('/login',
    [
        body('email').isEmail().withMessage('Invalid Email'),
        body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 characters long')
    ],
    storeController.loginStore
);    


router.get("/profile", 
    authMiddleware.authStore, 
    storeController.getStoreProfile
)


router.get('/logout',
    authMiddleware.authStore,
    storeController.logoutStore
);


router.put(
  '/gst-settings',
  authMiddleware.authStore,
  [
    body('gstApplicable')
      .isBoolean()
      .withMessage('GST Applicable must be a boolean'),

    body('gstRate')
      .optional({ nullable: true })
      .custom((value, { req }) => {
        if (req.body.gstApplicable && (value === null || value === undefined)) {
          throw new Error('GST Rate is required when GST is applicable');
        }
        if (value !== null && value !== undefined && value < 0) {
          throw new Error('GST Rate must be a positive number');
        }
        return true;
      }),

    body('restaurantChargeApplicable')
      .isBoolean()
      .withMessage('Restaurant Charge Applicable must be a boolean'),

    body('restaurantCharge')
      .optional({ nullable: true })
      .custom((value, { req }) => {
        if (req.body.restaurantChargeApplicable && (value === null || value === undefined)) {
          throw new Error('Restaurant Charge is required when applicable');
        }
        if (value !== null && value !== undefined && value < 0) {
          throw new Error('Restaurant Charge must be a positive number');
        }
        return true;
      }),
  ],
  storeController.updateStoreCharges
);

router.put(
    '/update-photo',
    authMiddleware.authStore,
    [
        body('photo').notEmpty().withMessage('Photo is required'),
    ],
    storeController.updateStorePhoto
);


router.put(
  "/update-info",
  authMiddleware.authStore,
  [
    body('storeName').notEmpty().isLength({ min: 3 }).withMessage('Store name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('storeDetails.address').notEmpty().isLength({ min : 15}).withMessage('Address should be at least 15 character long'),
    body('storeDetails.phoneNumber').isNumeric().isLength({min : 10 , max : 10}).withMessage("phone number is not valid"),
  ],
  storeController.updateStoreInfo
);




module.exports = router;