"use strict";
const mongoose = require("mongoose");
// Schemas
const { addSail } = require("./on-sale");
const { updateStaffHistory } = require("./staff");
const { subtractFromStorage } = require("./storage");
const { addFromDailyTasks } = require("./expenses");
// Model
const Products = mongoose.model('products');

exports.addTask = (req, res) => {
    const serverDate = new Date();
    const modifiedDate = `${serverDate.getDate()}/${serverDate.getMonth() + 1}/${serverDate.getFullYear()}`;
    const currTimeStamp = Date.now()
    const nonType = req.body.nonTuri;
    req.body.bonus = req.body.bonus ? req.body.bonus : []
    const breadsArr = [
        { breadName: nonType, quantity: req.body.nonSoni, jastaQuantity: req.body.jastaNonSoni },
        ...(req.body.bonus)
    ];
    // subtract from storage
    Products.findOne({ productName: nonType }, async (_err, currProduct) => {
        for (let i = 0; i < currProduct.requiredItems.length; i++) {
            const obj = currProduct.requiredItems[i]
            const sebstractResponse = await subtractFromStorage(obj, req.body.qoplarSoni);
            if (sebstractResponse.status === 400) {
                res.send(sebstractResponse);
                return
            }
        }
        // sends to sail
        let output = await addSail(breadsArr);
        // add to staff history
        let { group, smena, bonusTulov, tulov, xodim, jamiTulov, ...rest } = req.body;
        const perStaffIncome = jamiTulov / xodim.length;
        for (let i = 0; i < xodim.length; i++) {
            await updateStaffHistory(xodim[i], rest, perStaffIncome, modifiedDate);
        }

        // add to expenses section
        await addFromDailyTasks(currProduct.productName, currProduct.allExpensesPerBag, req.body.qoplarSoni, req.body.nonSoni, modifiedDate, currTimeStamp);

        res.send({ status: 200, msg: { addSail: output } })
    });

};