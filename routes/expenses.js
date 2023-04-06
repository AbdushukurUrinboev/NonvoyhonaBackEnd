"use strict";
const mongoose = require("mongoose");
// Schemas
const { expensesSchema } = require("./../schemas/schemas");
const { getDatesInRange } = require("./../custom/functions");
// Model
const Expenses = mongoose.model('expenses', expensesSchema);



exports.expenses = (_req, res) => {
    Expenses.find({}).then((result) => {
        res.send(result);
    });
};

exports.getIndividualExpense = (req, res) => {
    Expenses.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
};

const deletePrevMonths = async (givenMonth, givenYear) => {
    await Expenses.deleteMany({
        year: { $lt: givenYear }
    });
    if (givenMonth > 3) {
        return await Expenses.deleteMany({
            month: { $lte: givenMonth - 3 }
        });
    } else {
        return await Expenses.deleteMany({
            month: { $lte: givenMonth + 9, $gt: givenMonth }
        });
    }
}

exports.addFromStorage = async (object) => {
    let [day, month, year] = object.olinganSana.split("/");
    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);
    // altered To Expense Schema
    const toExpensesSchema = { name: object.productName, quantity: object.poductQuantity, customer: object.xamkor, overallPrice: object.umumiyNarhi, day, month, year, timeStamp: object.currTimeStamp }
    const newExpense = new Expenses(toExpensesSchema);
    // deletes from last 4 months
    await deletePrevMonths(month, year);

    // need to only include 3 months data
    return await newExpense.save();
}

exports.addFromDailyTasks = async (name, expensesPerBag, qoplarSoni, quantity, date, currTimeStamp) => {
    let [day, month, year] = date.split("/");
    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);
    // altered To Expense Schema
    const toExpensesSchema = { name, quantity, overallPrice: expensesPerBag * qoplarSoni, day, month, year, timeStamp: currTimeStamp }
    const newExpense = new Expenses(toExpensesSchema);
    return await newExpense.save();
}

exports.addExpense = async (req, res) => {
    const serverDate = new Date();
    let day = serverDate.getDate();
    let month = serverDate.getMonth() + 1;
    let year = serverDate.getFullYear();

    await deletePrevMonths(month, year);

    const timeStamp = Date.now()
    const newProduct = new Expenses({ ...(req.body), timeStamp, day, month, year });
    res.send(await newProduct.save());
};

const reportWithGivenDate = async (startDate, endDate) => {
    // day MUST be given as two digit number!!
    let [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    let [endYear, endMonth, endDay] = endDate.split("-").map(Number);

    const outcome = await Expenses.find({
        month: { $lte: endMonth, $gte: startMonth },
        year: { $lte: endYear, $gte: startYear }
    });
    let testres = getDatesInRange(startDate, endDate, outcome);
    return testres
}

const getLastWeek = async () => {
    const CurrenttimeStamp = Date.now();
    const lastWeek = CurrenttimeStamp - 10080000
    return await Expenses.find({
        timeStamp: { $lte: CurrenttimeStamp, $gt: lastWeek }
    });
}
// 12/4/2021
exports.reportExpenses = async (req, res) => {
    const { startDate, endDate } = req.query; // dates '2022-02-01'
    if (!startDate) {
        const lastWeekDT = await getLastWeek();
        res.send(lastWeekDT);
    } else {
        const output = await reportWithGivenDate(startDate, endDate);
        res.send(output);
    }

}


exports.deleteExpense = (req, res) => {
    Expenses.deleteOne({ _id: req.body.id }, (err) => {
        if (err) res.send(err);
        res.send("success!");
    });
}
exports.updateExpense = (req, res) => {
    Expenses.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true
    }).then((doc) => {
        res.send(doc);
    });
}