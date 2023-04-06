"use strict";
const mongoose = require("mongoose");
// Schemas
const { reportDataInRange } = require("./../custom/functions");
const { plansSchema } = require("./../schemas/schemas");
// Model
const Plans = mongoose.model('plans', plansSchema);

exports.plans = async (req, res) => {
    const { startDate, endDate } = req.query; // dates '2022-02-01'
    if (!startDate) {
        Plans.find({}).then((result) => {
            res.send(result);
        });
    } else {
        const output = await reportDataInRange(startDate, endDate, Plans);
        res.send(output);
    }

};

exports.onePlan = (req, res) => {
    Plans.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
};

exports.addPlan = (req, res) => {
    const serverDate = new Date();
    const modifiedDate = `${serverDate.getDate()}/${serverDate.getMonth() + 1}/${serverDate.getFullYear()}`;
    const newOrder = new Plans({ ...req.body, date: modifiedDate });
    newOrder.save((err, newOrderDoc) => {
        if (err) {
            res.send(err);
        } else {
            res.send(newOrderDoc);
        };
        // saved!
    });
};

exports.deletePlan = (req, res) => {
    Plans.deleteOne({ _id: req.body.id }, (err) => {
        if (err) res.send(err);
        res.send("success!");
    });
}
exports.updatePlan = (req, res) => {
    Plans.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}