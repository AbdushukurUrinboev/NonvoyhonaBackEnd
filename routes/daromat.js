"use strict";
const mongoose = require("mongoose");
// Schemas
const { getDatesInRange } = require("./../custom/functions")
const { daromatSchema } = require("./../schemas/schemas");
// Model
const Daromat = mongoose.model('daromat', daromatSchema);

exports.daromat = (_req, res) => {
    Daromat.find({}).then((result) => {
        res.send(result);
    });
};

const deletePrevMonths = async (givenMonth, givenYear) => {
    await Daromat.deleteMany({
        year: { $lt: givenYear }
    });
    if (givenMonth > 3) {
        return await Daromat.deleteMany({
            month: { $lte: givenMonth - 3 }
        });
    } else {
        return await Daromat.deleteMany({
            month: { $lte: givenMonth + 9, $gt: givenMonth }
        });
    }
}

exports.addFromSale = async (tempObj) => {
    const timeStamp = Date.now()
    let [day, month, year] = tempObj.date.split("/");
    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);
    // altered To Expense Schema
    const toExpensesSchema = { name: tempObj.name, quantity: tempObj.poductQuantity, overallPrice: tempObj.overallPrice, day, month, year, timeStamp: timeStamp }
    const newExpense = new Daromat(toExpensesSchema);
    // deletes from last 4 months
    await deletePrevMonths(month, year);

    // need to only include 3 months data
    return await newExpense.save();
}


const getLastWeek = async () => {
    const CurrenttimeStamp = Date.now();
    const lastWeek = CurrenttimeStamp - 10080000
    return await Daromat.find({
        timeStamp: { $lte: CurrenttimeStamp, $gt: lastWeek }
    });
}
exports.reportDaromat = async (req, res) => {
    const { startDate, endDate } = req.query; // dates '2022-02-01'
    if (!startDate) {
        const lastWeekDT = await getLastWeek();
        res.send(lastWeekDT);
    } else {
        const daromatDT = await Daromat.find({})
        const output = await getDatesInRange(startDate, endDate, daromatDT);
        res.send(output);
    }


}

const getProductLastWeek = async (product) => {
    const CurrenttimeStamp = Date.now();
    const lastWeek = CurrenttimeStamp - 10080000
    return await Daromat.find({
        timeStamp: { $lte: CurrenttimeStamp, $gt: lastWeek },
        name: product
    });
}

exports.reportDaromatPerProduct = async (req, res) => {
    const lastWeekDT = await getProductLastWeek(req.params.productName);
    res.send(lastWeekDT);
}

exports.deleteDaromat = (req, res) => {
    Expenses.deleteOne({ _id: req.body.id }, (err) => {
        if (err) res.send(err);
        res.send("success!");
    });
}
exports.updateDaromat = (req, res) => {
    Expenses.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}