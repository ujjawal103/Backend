const mongoose = require("mongoose");


const blacklistTokenSchema = new mongoose.Schema({
    token : {
        type : String , 
        required : true,
        unique : true,
    },
    createdAt : {
        type : Date,
        default : Date.now,
        expires : 24 * 60 * 60 //24 hours in sec.
    }
})

const blacklistToken = mongoose.model("BlacklistToken", blacklistTokenSchema);

module.exports = blacklistToken;