const mongoose  =  require('mongoose');
const { Message } = require('twilio/lib/twiml/MessagingResponse');
const Schema = mongoose.Schema;


const reminderSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    startTime:{
        type: Date,
        default: Date.now
    },
    reminderTime:{
        type: Date,
        required: true
    },
    sent:{
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('events', reminderSchema);