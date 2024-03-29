"use strict";
const mongoose = require("mongoose");
const fs = require('fs');

// Schemas
const { staffSchema } = require("./../schemas/schemas");
// Model
const Staff = mongoose.model('staff', staffSchema);
exports.staff = (_req, res) => {
    Staff.find({}).then((result) => {
        res.send(result);
    });
};

exports.updateStaffHistory = async (nameOfTheEmployee, addingObj, tulov, date) => {
    // given name must be spaced between firstName and lastName
    const foundEmployee = await Staff.findOne({ firstName: nameOfTheEmployee.split(" ")[0], lastName: nameOfTheEmployee.split(" ")[1] });
    if (foundEmployee.workHistory.length >= 30) {
        const newArr = [...(foundEmployee.workHistory)];
        newArr.shift();
        foundEmployee.workHistory = [...(newArr), { ...addingObj, tulov, date }];
    } else {
        foundEmployee.workHistory = [...(foundEmployee.workHistory), { ...addingObj, tulov, date }];
    }
    return await foundEmployee.save();
}

exports.specificStaff = (req, res) => {
    Staff.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
}

exports.addSalary = async (req, res) => {
    // chiqimlarga qoshish kerak
    const staffID = req.params.id;
    const foundStaff = await Staff.findOne({ _id: staffID });
    if (foundStaff.AllsalaryHistory >= 12) {
        const newArr = [...(foundStaff.AllsalaryHistory)];
        newArr.shift();
        foundStaff.AllsalaryHistory = [...(newArr), req.body];
    } else {
        foundStaff.AllsalaryHistory = [...(foundStaff.AllsalaryHistory), req.body];
    }
    const saved = await foundStaff.save();
    res.send(saved);
}

exports.addNewStaff = async (req, res) => {
    const newStaff = new Staff({ ...(req.body), image: req.file ? req.file.path : "none" });
    newStaff.save(function (err, doc) {
        if (err) {
            res.send(err)
        } else {
            res.send("success!")
        };
        // saved!
    });
};

exports.deleteStaff = async (req, res) => {
    const deletingStaff = await Staff.findOne({ _id: req.body.id });
    if (deletingStaff.image != "none") {
        fs.unlink(deletingStaff.image, (err) => err);
    }
    const result = await deletingStaff.remove()
    res.send(result);

}

exports.updateStaff = async (req, res) => {
    const filter = { _id: req.body.changingID }
    if (req.file) {
        const doc = await Staff.findOneAndUpdate(filter, { ...(req.body), image: req.file.path });
        fs.unlink(doc.image, (err) => err);
        const resp = await Staff.findOne(filter)
        res.send(resp);
    } else {
        Staff.findOneAndUpdate(filter, req.body, {
            new: true
        }).then((doc) => {
            res.send(doc);
        });
    }
}

exports.addFine = async (req, res) => {
    let filter = { _id: req.params.id }
    let foundStaff = await Staff.findOne(filter);
    const formattedDate = new Date(req.body.date); // 2023-01-12
    foundStaff.fines = [...(foundStaff.fines), { ...req.body, date: formattedDate }];

    const savedDoc = await foundStaff.save();

    res.send(savedDoc);

}

