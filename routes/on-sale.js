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
    // sample obj = {order: [{name: 'Patir', quantity: 5, price: 10000}], productQuantity: 3, customer: "", date: "12/32/34", avans: 60000, price: 70000, customerType: "zakaz"}
    // sample obj = {order: [{name: 'Patir', quantity: 5, price: 10000, customerID: orderID}], customer: "", price: 70000, customerType: "zakaz"}
    // add to customer history
    // given name must be spaced between firstName and lastName

    // handle remove from orders collec or onSale
    if (req.body.customerType === "zakaz") {
        for (let i = 0; i < req.body.order.length; i++) {
            let currentOrder = req.body.order[i];
            await deleteOrderFromSale(currentOrder.customerID, currentOrder.quantity);
            await subtrackFromSale({ name: currentOrder.name, quantity: currentOrder.quantity });

            // add daromat
            const newDaromat = {
                name: currentOrder.name,
                quantity: currentOrder.quantity,
                date: modifiedDate,
                overallPrice: currentOrder.price
            }
            await addFromSale(newDaromat);
        }
    } else {
        for (let i = 0; i < req.body.order.length; i++) {
            let currOrder = req.body.order[i];
            await subtrackFromSale({ name: currOrder.name, quantity: currOrder.quantity });

            // add daromat
            const newDaromat = {
                name: currOrder.name,
                quantity: currOrder.quantity,
                date: modifiedDate,
                overallPrice: currOrder.price
            }
            await addFromSale(newDaromat);
        }
    }

    const allSoldBreads = req.body.order.map((ord) => ord.name).join();


    let newOrderForCustomer = null;
    let doc = await Customers.findOne({ firstName: req.body.customer.split(" ")[0], lastName: req.body.customer.split(" ")[1] });
    if (doc) {
        newOrderForCustomer = {
            product: allSoldBreads,
            productQuantity: req.body.productQuantity,
            date: modifiedDate,
            avans: req.body.avans,
            overall: req.body.price,
            status: req.body.avans === 0 ? "To'lanmadi" : req.body.avans === req.body.price ? "To'landi" : "Chala"
        }
        doc.history = [...(doc.history), newOrderForCustomer];

    }

    // nasiya

    if (req.body.customerType !== "zakaz") {
        if (doc) {
            const resultttt = await doc.save();
            if (req.body.avans === 0 || req.body.avans < req.body.price) {
                const nasiyaScheme = { ...newOrderForCustomer, customer: req.body.customer, customerType: req.body.customerType != "zakaz" ? req.body.customerType : "temporary", productID: resultttt.history[resultttt.history.length - 1]._id, userId: doc._id }
                await addNasiyaManually(nasiyaScheme);
            }
        } else {
            if (req.body.avans === 0 || req.body.avans < req.body.price) {
                const nasiyaScheme = { product: allSoldBreads, customer: req.body.customer, productQuantity: req.body.productQuantity, date: modifiedDate, avans: req.body.avans, overall: req.body.price, customerType: req.body.customerType != "zakaz" ? req.body.customerType : "temporary" }
                await addNasiyaManually(nasiyaScheme);
            }
        }
    }



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