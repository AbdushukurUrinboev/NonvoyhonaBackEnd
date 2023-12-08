"use strict";
const mongoose = require("mongoose");
// Schemas
const { DailyReport } = require("./../schemas/schemas");
// Model

exports.dailyReport = async (req, res) => {
   let { startDate, endDate } = req.body;
   startDate = new Date(startDate).toISOString();
   endDate = new Date(endDate).toISOString();

   const foundUpdates = await DailyReport.find({
      date: { $gte: startDate, $lte: endDate }
   });
   res.send(foundUpdates);
};

exports.addReport = async (obj) => {
   const newOrder = new DailyReport(obj);
   await newOrder.save();
};