"use strict";
const mongoose = require("mongoose");
// Schemas

const { attendaceSchema, staffSchema } = require("./../schemas/schemas");
// Model
const Attandance = mongoose.model('attandance', attendaceSchema);
const Staff = mongoose.model('staff', staffSchema);


exports.attandance = async (req, res) => {
    let { startDate, endDate } = req.query; // dates '2022-02-01'
    if (startDate && endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        const response = await Attandance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });
        res.send(response);
    } else {
        const today = new Date();


        const uzbekistanTimeOffset = 5; // Uzbekistan Time is UTC+5
        const uzbekistanTime = new Date(today.getTime() + uzbekistanTimeOffset * 60 * 60 * 1000);
        uzbekistanTime.setHours(0, 0, 0, 0);


        const tomorrow = new Date(uzbekistanTime);
        tomorrow.setDate(uzbekistanTime.getDate() + 1);


        const response = await Attandance.find({
            date: {
                $gte: uzbekistanTime,
                $lt: tomorrow
            }
        });
        if (response && response.length > 1) {
            res.send(response);
        } else {
            let allStaff = await Staff.find({ group: "No" });
            allStaff = allStaff.sort((a, b) => a.group === "No" ? -1 : 1);

            const intitialAttendanceState = allStaff.map((staff) => {
                return { firstName: staff.firstName, lastName: staff.lastName, present: false }
            });
            await Attandance.insertMany(intitialAttendanceState);
            const response = await Attandance.find({
                date: {
                    $gte: today,
                    $lt: tomorrow
                }
            });
            res.send(response);

        }
    }
};

exports.oneAttandance = async (req, res) => {
    const result = await Attandance.findOne({ firstName: req.body.firstName, lastName: req.body.lastName });
    res.send(result);
}


exports.addAttandance = async (req, res) => {
    // req.body = {present: true, staffId: staffID}
    const { staffId, ...newAttandanceSchema } = req.body;
    const foundStaff = await Staff.findOne({ _id: staffId });
    const newAttandance = new Attandance({ firstName: foundStaff.firstName, lastName: foundStaff.lastName, ...newAttandanceSchema });
    const response = await newAttandance.save();
    res.send(response);
};
exports.updateAttandance = (req, res) => {
    Attandance.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}