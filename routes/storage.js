"use strict";
const mongoose = require("mongoose");
const { addFromStorage } = require("./expenses");
const fs = require("fs");
// Schemas
const { storageSchema } = require("./../schemas/schemas");
// Model
const Storage = mongoose.model('storage', storageSchema);

exports.storage = (_req, res) => {
    Storage.find({}).then((result) => {
        res.send(result);
    });
};

exports.getSpecificStorage = (req, res) => {
    Storage.findOne({ _id: req.params.id }).then((result) => {
        res.send(result);
    });
}

exports.addProduct = async (req, res) => {
    const serverDate = new Date();
    const modifiedDate = `${serverDate.getDate()}/${serverDate.getMonth() + 1}/${serverDate.getFullYear()}`;
    const exactTime = `${serverDate.getHours()}:${serverDate.getMinutes()}`;
    const currTimeStamp = Date.now()
    const result = await Storage.findOne({ productName: req.body.productName });
    if (!result) {
        const newProduct = new Storage({ ...(req.body), storageImage: req.file ? req.file.path : "none", olinganSana: modifiedDate, olinganSoat: exactTime });
        const newProductForStorage = await newProduct.save();
        // adds to expenses
        // console.log("hello")
        // console.log({ olinganSana: modifiedDate, olinganSoat: exactTime, currTimeStamp });
        await addFromStorage({ ...(req.body), olinganSana: modifiedDate, olinganSoat: exactTime, currTimeStamp })
        res.send(newProductForStorage);
    } else {
        result.poductQuantity += parseFloat(req.body.poductQuantity);
        const updatedDoc = await result.save();
        // adds to expenses
        await addFromStorage({ ...(req.body), olinganSana: modifiedDate, olinganSoat: exactTime, currTimeStamp })
        res.send(updatedDoc);
    }
};
exports.subtractFromStorage = async (obj, qop) => {
    const result = await Storage.findOne({ productName: obj.itemName });
    if (result) {
        if (result.poductQuantity - (obj.itemQuantity * qop) < 0) {
            return { status: 400, msg: "Yetarli maxsulot yo'q" }
        } else {
            result.poductQuantity -= (obj.itemQuantity * qop);
            const updated = await result.save();
            return { status: 200, dt: updated }

        }
    } else {
        return { status: 400, msg: "Yetarli maxsulot yo'q" }
    }


}

exports.deleteProduct = async (req, res) => {
    const deletingItem = await Storage.findOne({ _id: req.body.id });
    if (deletingItem.storageImage != "none") {
        fs.unlink(deletingItem.storageImage, (err) => err);
    }
    const result = await deletingItem.remove()
    res.send(result);

}
exports.updateProduct = async (req, res) => {
    const filter = { _id: req.body.changingID }
    if (req.file) {
        const doc = await Storage.findOneAndUpdate(filter, { ...(req.body), storageImage: req.file.path });
        fs.unlink(doc.storageImage, (err) => err);
        const resp = await Storage.findOne(filter)
        res.send(resp);
    } else {
        Storage.findOneAndUpdate(filter, req.body, {
            new: true
        }).then((doc) => {
            res.send(doc);
        });
    }
}