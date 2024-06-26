"use strict";
const mongoose = require("mongoose");
const { addHistory } = require("./users");
// Schemas

const { addNasiyaManually } = require("./nasiya");
const { ordersSchema } = require("./../schemas/schemas");
// Model
const { reportDataInRange } = require("./../custom/functions");
const Orders = mongoose.model("orders", ordersSchema);

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
  const { userID } = req.body;
  const serverDate = new Date();
  const modifiedDate = `${serverDate.getDate()}/${
    serverDate.getMonth() + 1
  }/${serverDate.getFullYear()}`;
  const exactTime = `${serverDate.getHours()}:${serverDate.getMinutes()}`;
  let allProducts = "";
  let allquantity = 0;
  for (let i = 0; i < req.body.orders.length; i++) {
    let currObject = req.body.orders[i];
    if (req.body.orders.length === i + 1) {
      allProducts += currObject.order;
      allquantity += currObject.productQuantity;
    } else {
      allProducts += currObject.order + ", ";
      allquantity += currObject.productQuantity + ", ";
    }
    const newOrder = new Orders({
      ...currObject,
      date: modifiedDate,
      time: exactTime,
    });
    await newOrder.save();
  }
  let response = "no nasiya";
  if (req.body.avans < req.body.neededPayment) {
    response = await addNasiyaManually({
      product: allProducts,
      customerType: req.body.orders[0].type,
      customer: req.body.orders[0].customer,
      productQuantity: allquantity,
      date: modifiedDate,
      overall: req.body.neededPayment,
      avans: req.body.avans,
    });
  }

  await addHistory(userID, {
    customerName: req.body.orders[0].customer,
    bread: allProducts,
    quantity: allquantity,
    pendingPayment: req.body.neededPayment,
    avans: req.body.avans,
    date: modifiedDate,
  });
  res.send({
    code: 200,
    dt: response,
  });
};

exports.deleteOrderFromSale = async (id, quantity) => {
  const result = await Orders.findOne({ _id: id });
  if (result.productQuantity > quantity) {
    result.productQuantity -= quantity;
    return await result.save();
  } else if (result.productQuantity === quantity) {
    return await result.remove();
  } else {
    return;
  }
};
exports.deleteOrder = (req, res) => {
  Orders.deleteOne({ _id: req.body.id }, (err) => {
    if (err) return err;
    res.send("success!");
  });
};
exports.updateOrder = (req, res) => {
  Orders.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
    new: true,
  }).then((doc) => {
    res.send(doc);
  });
};
