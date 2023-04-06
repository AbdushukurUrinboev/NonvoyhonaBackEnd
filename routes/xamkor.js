"use strict";
const mongoose = require("mongoose");
// Schemas
const { xamkorSchema } = require("./../schemas/schemas");
// Model
const Xamkor = mongoose.model('xamkor', xamkorSchema);

exports.xamkor = (_req, res) => {
    Xamkor.find({}).then((result) => {
        res.send(result);
    });
};

exports.oneXamkor = (req, res) => {
    Xamkor.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
};

exports.addXamkor = (req, res) => {
    const newOrder = new Xamkor(req.body);
    newOrder.save((err, newOrderDoc) => {
        if (err) {
            res.send(err);
        } else {
            res.send(newOrderDoc);
        };
        // saved!
    });
};

exports.deleteXamkor = (req, res) => {
    Xamkor.deleteOne({ _id: req.body.id }, (err) => {
        if (err) res.send(err);
        res.send("success!");
    });
}
exports.updateXamkor = (req, res) => {
    Xamkor.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}