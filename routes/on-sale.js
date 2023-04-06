"use strict";
const mongoose = require("mongoose");
// Schemas
const { deleteOrderFromSale } = require("./orders");
const { onSailSchema } = require("../schemas/schemas");
const { addNasiyaManually } = require("./nasiya");
const { addFromSale } = require("./daromat")
// Model
const Products = mongoose.model('products');
const OnSail = mongoose.model('onSail', onSailSchema);
const Customers = mongoose.model('customers');

exports.onSail = (_req, res) => {
    OnSail.find({}).then((result) => {
        res.send(result);
    });
};
exports.addSail = async (breadsArr) => {

    for (let i = 0; i < breadsArr.length; i++) {
        const foundBread = await Products.findOne({ productName: breadsArr[i].breadName });
        const newV = { breadName: breadsArr[i].breadName, quantity: parseFloat(breadsArr[i].quantity) - parseFloat(breadsArr[i].jastaQuantity), imageUrl: foundBread.productImage }
        const adventure = await OnSail.findOne({ breadName: breadsArr[i].breadName });
        if (!adventure || adventure === "null") {
            const newProduct = new OnSail(newV);
            await newProduct.save();
        } else {
            adventure.quantity = parseFloat(adventure.quantity) + parseFloat(breadsArr[i].quantity);
            await adventure.save();
        }
    }
    return "saved!!!";
};

const subtrackFromSale = async ({ name, quantity }) => {
    const doc = await OnSail.findOne({ breadName: name });
    if (doc.quantity - quantity <= 0) {
        await OnSail.deleteOne({ breadName: name });
    } else {
        doc.quantity = doc.quantity - quantity;
        return await doc.save();
    }
}


exports.sellToCustomer = async (req, res) => {
    const serverDate = new Date();
    const modifiedDate = `${serverDate.getDate()}/${serverDate.getMonth() + 1}/${serverDate.getFullYear()}`
    // sample obj = {order: Patir, productQuantity: 3, customer: "Abdurashid Abdullayev",date: "12/32/34", avans: 60000, price: 70000, customerType: "zakaz"}
    // add to customer history
    // given name must be spaced between firstName and lastName
    let doc = await Customers.findOne({ firstName: req.body.customer.split(" ")[0], lastName: req.body.customer.split(" ")[1] });
    if (doc) {
        const newOrderForCustomer = {
            product: req.body.order,
            productQuantity: req.body.productQuantity,
            date: modifiedDate,
            avans: req.body.avans,
            overall: req.body.price,
            status: req.body.avans === 0 ? "To'lanmadi" : req.body.avans === req.body.price ? "To'landi" : "Chala"
        }
        doc.history = [...(doc.history), newOrderForCustomer];

    }


    if (doc) {
        const resultttt = await doc.save();
        if (newOrderForCustomer.status === "To'lanmadi" || newOrderForCustomer.status === "Chala") {
            const nasiyaScheme = { ...newOrderForCustomer, customerType: req.body.customerType != "zakaz" ? req.body.customerType : "temporary", productID: resultttt.history[resultttt.history.length - 1]._id, userId: doc._id }
            await addNasiyaManually(nasiyaScheme);
        }
    } else {
        if (req.body.avans === 0 || req.body.avans < req.body.price) {
            const nasiyaScheme = { product: req.body.order, productQuantity: req.body.productQuantity, date: modifiedDate, avans: req.body.avans, overall: req.body.price }
            await addNasiyaManually(nasiyaScheme);
        }
    }

    // handle remove from orders collec or onSale
    if (req.body.customerType === "zakaz") {
        await deleteOrderFromSale(req.body.customerID);
    }
    await subtrackFromSale({ name: req.body.order, quantity: req.body.productQuantity });

    // add daromat
    const newDaromat = {
        name: req.body.order,
        quantity: req.body.productQuantity,
        date: modifiedDate,
        overallPrice: req.body.price
    }
    await addFromSale(newDaromat);

    res.send("success!");
};

exports.deleteSail = (req, res) => {
    OnSail.deleteOne({ _id: req.body.id }, (err) => {
        if (err) return err;
        res.send("success!");
    });
}
exports.updateSail = (req, res) => {
    OnSail.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}