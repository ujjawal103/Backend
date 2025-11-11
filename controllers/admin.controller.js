const adminModel = require("../models/admin.model");
const blacklistTokenModel = require("../models/blacklistToken.model")
const adminServices = require("../services/admin.service")
const {validationResult} = require("express-validator")





module.exports.registerAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password } = req.body;

    const isAdminExists = await adminModel.findOne({ email });
    if (isAdminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await adminModel.hashedPassword(password);

    // ✅ First create the admin
    const admin = await adminServices.createAdmin({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      email,
      password: hashedPassword,
    });

    const token = admin.generateAuthToken();
    res.status(201).json({ token, admin });
  } catch (error) {
    console.error("❌ Error in registerAdmin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.loginAdmin = async (req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    const {email , password} = req.body;
    const admin = await adminModel.findOne({email}).select("+password"); //forcefully password retrieved
    if(!admin){
        return res.status(401).json({message : "Invalid Email or Password"});
    }
    const isMatchPassword = await admin.comparePassword(password);
    if(!isMatchPassword){
        return res.status(401).json({message : "Invalid Email or Password"});
    }
    const token = admin.generateAuthToken();
    res.cookie("token" , token);
    res.status(200).json({token , admin});
}


module.exports.getAdminProfile = async (req,res , next) =>{
    res.status(200).json({admin : req.admin});
}



module.exports.logoutAdmin = async (req,res , next) =>{
     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message : "Unauthorized access"});
    }
    // Add token to blacklist
    await blacklistTokenModel.create({token});
    res.clearCookie("token");
    res.status(200).json({message : "Logged out successfully"});
}