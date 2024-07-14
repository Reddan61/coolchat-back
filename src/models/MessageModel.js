const {model,Schema} = require('mongoose');
const mongoose = require('mongoose')


const MessageSchema = new Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    }],
    messages: [{
        userBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        text: {
            type:String || null,
            default:null
        },
        date: {
            type: String
        },
        imagesSrc: [{
            type:String
        }],
        audioSrc:{
            type:String || null,
            default:null
        },
        require:false
    }]
});


module.exports.MessageModel = model("Message",MessageSchema);