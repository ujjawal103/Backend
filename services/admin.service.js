const adminModel = require("../models/admin.model");



module.exports.createAdmin = async ({email , firstName , lastName , password}) => {
  if(!firstName || !email || !password){
    throw new Error("All fields are required");
  }
  else{
    const admin = adminModel.create({
        fullName : {
            firstName,
            lastName,
        },
        email ,
        password
    })
    return admin;
  }
};