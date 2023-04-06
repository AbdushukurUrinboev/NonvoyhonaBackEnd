"use strict";
const mongoose = require("mongoose");
// Schemas
const { customersSchema } = require("./../schemas/schemas");
// Model
const Customers = mongoose.model('customers', customersSchema);

exports.customers = (req, res) => {
    Customers.find({}).then((result) => {
        res.send(result);
    });
};

exports.getSpecificCustomer = (req, res) => {
    const customerID = req.params.id;
    Customers.findOne({ _id: customerID }).then((result) => {
        res.send(result);
    });
}

exports.getTypeOfCustomers = (req, res) => {
    const customerType = req.params.type;
    Customers.find({ customerType }).then((result) => {
        res.send(result);
    });
}

exports.addCustomers = (req, res) => {
    const newCustomer = new Customers(req.body);
    newCustomer.save(function (err, doc) {
        if (err) {
            res.send(res.send(err));
        } else {
            res.send(doc);
        };
        // saved!
    });
};

exports.deleteCustomer = (req, res) => {
    Customers.deleteOne({ _id: req.body.id }, (err) => {
        if (err) return err;
        res.send("success!");
    });
}
exports.updateCustomer = (req, res) => {
    Customers.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}