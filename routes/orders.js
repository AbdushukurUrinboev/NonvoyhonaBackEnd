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

exports.addOrder = async (req, res) => {



    const serverDate = new Date();
    const modifiedDate = `${serverDate.getDate()}/${serverDate.getMonth() + 1}/${serverDate.getFullYear()}`;
    const exactTime = `${serverDate.getHours()}:${serverDate.getMinutes()}`;
    for (let i = 0; i < req.body.orders.length; i++) {
        let currObject = req.body.orders[i]
        const newOrder = new Orders({ ...(currObject), date: modifiedDate, time: exactTime });
        if (currObject.avans < currObject.price * currObject.productQuantity) {
            await addNasiyaManually({ product: currObject.order, customerType: currObject.type, customer: currObject.customer, productQuantity: currObject.productQuantity, date: modifiedDate, overall: currObject.price, avans: currObject.avans })
        }
        await newOrder.save();
    }


};

exports.deleteOrderFromSale = async (id, quantity, avans) => {
    const result = await Orders.findOne({ _id: id });
    if (result.productQuantity > quantity) {
        result.productQuantity -= quantity;
        result.avans += avans;
        return await result.save()
    } else if (result.productQuantity === quantity) {
        return await result.remove()
    } else {
        return
    }
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