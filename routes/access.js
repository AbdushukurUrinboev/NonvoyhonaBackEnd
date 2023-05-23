"use strict";
const mongoose = require("mongoose");
// Schemas
const { access } = require("./../schemas/schemas");
// Model
const Access = mongoose.model('access', access);

exports.access = (_req, res) => {
    Access.find({}).then((result) => {
        res.send(result);
    });
};

exports.oneAccess = (req, res) => {
    Access.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
};

exports.addAccess = (req, res) => {
    const newOrder = new Access(req.body);
    newOrder.save((err, newOrderDoc) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(newOrderDoc);
        };
        // saved!
    });
};

exports.deleteAccess = (req, res) => {
    Access.deleteOne({ _id: req.body.id }, (err) => {
        if (err) res.send(err);
        res.send("success!");
    });
}
exports.updateAccess = (req, res) => {
    Access.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}