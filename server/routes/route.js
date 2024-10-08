require('dotenv').config();
const express = require('express');
const routes = express.Router();
var twilio = require('twilio');
const cron = require('node-cron');
const ReminderSchema = require('../models/message');
const { AwsInstance } = require('twilio/lib/rest/accounts/v1/credential/aws');
const moment = require('moment');
const message = require('../models/message');
const { now } = require('mongoose');
const {DateTime} = require('luxon');

// setting out main rout
routes.get('/', (req, res) => {
    res.render('index',{
        tiems:[4,3,4,3]
    })
})


// Example route for sending a message
routes.post('/set-reminder', async (req, res) => {
    try {
        const now = Date.now();
        const { email, reminderTime, startTime, title, description } = req.body;
        // send_sms(description)
        // string the values to teh database 
        const sms = new ReminderSchema({
            title,
            description,
            startTime: new Date(now),
            reminderTime: new Date(reminderTime),
            email
        });

        await sms.save();

        // finding all the data.

        const data = await ReminderSchema.find();
        res.rect('/schedule')
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// setting out the schedule page to view all the events.
routes.get('/schedule', async (req, res) => {
    const data = await ReminderSchema.find();
    res.render('schedule', {
        data
    })
})
/**
 * GET post by ID
 */

routes.get('/events/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        // find the data with id
        const data = await ReminderSchema.findById(slug);
        if (!data) {
            return res.status(404).send('Event not Found!');
        }

        res.render('event', { data })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
})

/**
 * GET by ID
 * to delete single data  
 * render to '/schedule`  .
 */
routes.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await ReminderSchema.findByIdAndDelete(id);
        const data = await ReminderSchema.find();
        res.redirect('/schedule');

    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    };
});


/**
 * POST by ID
 * get  data of single reminder using findOne 
 * render to `/update` to update page .
 */
routes.get('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ReminderSchema.findOne({ _id: id });
        res.render('update', { data })
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});


/**
 * GET post by ID
 * to update details 
 * redirect to `/events/${id}` to event page.
 */

routes.post('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { email, reminderTime,  title, description } = req.body;
        const now = Date.now();
        const data = await ReminderSchema.findOne({_id: id});
        if(data){
            data.email = email;
            data.reminderTime = new Date(reminderTime);
            data.startTime = new Date(now);
            data.title = title;
            data.description = description;

            await data.save();
            res.redirect(`/events/${id}`);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
        console.log(error);
    }
})

//Background job to check for reminders
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const events = await ReminderSchema.find({
            reminderTime: { $lte: now },
            sent: false
        });

        events.forEach(async (event) => {
            const formattedTime = moment(event.startTime).format('LLLL');
            send_sms(`You have a reminder for event: ${event.title} at ${moment(event.startTime).format('LLLL')}`);

            event.sent = true;
            await event.save();
        })
    } catch (error) {
        console.error('Error during cron job:', error);
    }
})


// an sms sending function..
const send_sms = async (message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        var client = new twilio(accountSid, authToken);

        client.messages
            .create({
                body: message,
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+13828853022'
            })
            .then(message => console.log(message.sid))
    } catch (error) {
        console.log(error)
    }
}

module.exports = routes