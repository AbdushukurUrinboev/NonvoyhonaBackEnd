"use strict";
const mongoose = require("mongoose");
// Schemas

const { addNasiyaManually } = require("./nasiya");
const { ordersSchema } = require("./../schemas/schemas");
// Model
const { reportDataInRange } = require("./../custom/functions");
const Orders = mongoose.model('orders', ordersSchema);

exports.orders = async (req, res) => {
    const { startDate, endDate } = req.query; // dates '2022-02-01'
    if (!startDate) {
        Orders.find({}).then((result) => {
            res.send(result);
        });
    } else {
        const output = await reportDataInRange(startDate, endDate, Orders);
        res.send(output);
    }


};

exports.oneOrder = (req, res) => {
    Orders.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
};

exports.addOrder = (req, res) => {
    const serverDate = new Date();
    const modifiedDate = `${serverDate.getDate()}/${serverDate.getMonth() + 1}/${serverDate.getFullYear()}`;
    const exactTime = `${serverDate.getHours()}:${serverDate.getMinutes()}`;
    const newOrder = new Orders({ ...(req.body), date: modifiedDate, time: exactTime });
    if (req.body.avans < req.body.price * req.body.productQuantity) {
        addNasiyaManually({ product: req.body.order, customer: req.body.customer, productQuantity: req.body.productQuantity, date: modifiedDate, overall: req.body.price, avans: req.body.avans })
    }
    newOrder.save(async (err, newOrderDoc) => {
        if (err) {
            res.send(err);
        } else {
            res.send(newOrderDoc);
        };
        // saved!
    });

};

exports.deleteOrderFromSale = async (id) => {
    const result = await Orders.deleteOne({ _id: id });
    return result;
}
exports.deleteOrder = (req, res) => {
    Orders.deleteOne({ _id: req.body.id }, (err) => {
        if (err) return err;
        res.send("success!");
    });
}
exports.updateOrder = (req, res) => {
    Orders.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}