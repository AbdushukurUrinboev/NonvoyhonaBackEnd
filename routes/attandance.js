"use strict";
const mongoose = require("mongoose");
// Schemas
const { attendaceSchema, staffSchema } = require("./../schemas/schemas");
// Model
const Attandance = mongoose.model('attandance', attendaceSchema);
const Staff = mongoose.model('staff', staffSchema);


exports.attandance = async (req, res) => {
    const { startDate, endDate } = req.query; // dates '2022-02-01'
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const response = await Attandance.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    });
    res.send(response);
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