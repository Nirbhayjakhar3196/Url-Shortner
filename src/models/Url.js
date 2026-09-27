const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({

    originalUrl:{
        type: String,
        required: true,
    },
    shortId : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true,
        trim : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    clicks:{
        type :Number,
        default :0
    },
    lastClickedAt:{
        type : Date,
        default:null
    }

} , {timestamps : true})

module.exports = mongoose.model("Url" , urlSchema);