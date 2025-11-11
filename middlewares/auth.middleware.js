const adminModel = require("../models/admin.model");
const bcrypt = require("bcrypt");
const { json } = require("express");
const jwt = require("jsonwebtoken");
const blacklistToken = require("../models/blacklistToken.model");
const barberStoreModel = require("../models/restronStore.model");

module.exports.authSuperAdmin = async (req , res , next) =>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];    //? means if it is undefined then it will not throw error otherwise we can't use split()here.
    if(!token){
        res.status(401).json({message : "Unathorized access"});
        return;
    }
    const isBlackListedToken = await blacklistToken.findOne({ token : token })
    if(isBlackListedToken){
        return res.status(401).json({message : "Unathorized access"});
    }

    //verify the token ---> decode the token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);      //it return the data that is pushed at login/register time ----> _id
        const admin = await adminModel.findById(decoded._id);
        if(!admin || admin.role !== 'superadmin'){
            res.status(401).json({message : "Unathorized access"});
            return;
        }
        req.admin = admin; //now we can access admin in any controller / route
        return next();
    }catch(err){
        //  console.log("error in auth")
         return res.status(401).json({message : "Unathorized access"});
    }
}



module.exports.authStore = async (req , res , next) =>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        res.status(401).json({message : "Unathorized access"});
        return;
    }

    const isBlackListedToken = await blacklistToken.findOne({ token : token })
    if(isBlackListedToken){
        return res.status(401).json({message : "Unathorized access"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const store = await barberStoreModel.findById(decoded._id);
        if(!store){
            res.status(401).json({message : "Unathorized access"});
            return;
        }
        
        req.store = store; //now we can access store in any controller / route
        return next();
    }catch(err){

         return res.status(401).json({message : "Unathorized access"});
    }
}