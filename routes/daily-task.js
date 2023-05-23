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
        for (let i = 0; i < xodim.length; i++) {
            let foundRole = currProduct.staffShare.find(obj => obj.type === xodim[i].type);
            const perStaffShare = xodim[i].joined ? foundRole.share / xodim[i].staff.length : foundRole.share;
            if (xodim[i].staff.length > 1) {
                for (let j = 0; j < xodim[i].staff.length; j++) {
                    await updateStaffHistory(xodim[i].staff[j], rest, perStaffShare, modifiedDate);
                }
            } else {
                await updateStaffHistory(xodim[i].staff[0], rest, foundRole.share, modifiedDate);
            }
        }

        // add to expenses section
        await addFromDailyTasks(currProduct.productName, currProduct.allExpensesPerBag, req.body.qoplarSoni, req.body.nonSoni, modifiedDate, currTimeStamp);

        res.send({ status: 200, msg: { addSail: output } })
    });

};
