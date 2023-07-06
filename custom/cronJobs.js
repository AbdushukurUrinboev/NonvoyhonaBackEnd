const cron = require('node-cron');
const mongoose = require("mongoose");
const { AttandanceModel: Attandance } = require('./../routes/attandance'); // Replace with the path to your Mongoose model file
const { staffSchema } = require('./../schemas/schemas');

const Staff = mongoose.model('staff', staffSchema);

const createNewObject = async () => {
    const allStaff = await Staff.find({});

    const intitialAttendanceState = allStaff.map((staff) => {
        return { firstName: staff.firstName, lastName: staff.lastName, present: false }
    });
    Attandance.insertMany(intitialAttendanceState)
}



// Define the cron job schedule
cron.schedule('0 1 * * *', createNewObject);

module.exports = cron;
