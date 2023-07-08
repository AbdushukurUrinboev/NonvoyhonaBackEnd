const cron = require('node-cron');
const mongoose = require("mongoose");
const { staffSchema, attendaceSchema } = require('./../schemas/schemas');

const Attandance = mongoose.model('attandance', attendaceSchema);
const Staff = mongoose.model('staff', staffSchema);

const createNewObject = async () => {
    const allStaff = await Staff.find({});

    const intitialAttendanceState = allStaff.map((staff) => {
        return { firstName: staff.firstName, lastName: staff.lastName, present: false }
    });
    Attandance.insertMany(intitialAttendanceState);
}



// Define the cron job schedule
cron.schedule('0 1 * * *', createNewObject, {
    timezone: "Asia/Tashkent"
});

module.exports = cron;
