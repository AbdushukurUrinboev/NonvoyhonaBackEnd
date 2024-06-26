const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { attandanceModify, storeMax20 } = require("./middlewares");

const bonusBreadSchema = new Schema({
  breadName: String,
  quantity: Number,
  jastaQuantity: Number,
});
const customersHistorySchema = new Schema({
  product: String,
  productQuantity: Number,
  date: String,
  avans: Number,
  overall: Number,
  status: {
    type: String,
    enum: ["To'landi", "Chala", "To'lanmadi"],
  },
});

const salarySchema = new Schema({
  date: String,
  paid: Number,
});

const usersHistorySchema = new Schema({
  customerName: String,
  bread: String,
  quantity: String,
  pendingPayment: Number,
  avans: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});
const usersSchema = new Schema({
  fullName: String,
  login: String,
  password: String,
  role: String,
  history: [usersHistorySchema],
});

usersSchema.pre("save", function (next) {
  const currentDate = new Date();
  this.history = this.history.filter((item) => {
    // Keep history items within the last 6 months
    return currentDate - item.date <= 6 * 30 * 24 * 60 * 60 * 1000;
  });
  next();
});

const customersSchema = new Schema({
  firstName: String,
  lastName: String,
  phone: String,
  phone2: String,
  status: String,
  workPlace: String,
  customerType: { type: String, enum: ["temporary", "daily"] },
  address: String,
  history: [customersHistorySchema],
});
const storageSchema = new Schema({
  // product
  productName: String,
  description: String,
  productPrice: Number,
  poductQuantity: Number,
  umumiyNarhi: Number,
  olinganSana: String,
  berilganAvans: Number,
  olinganSoat: String,
  xamkor: String,
  storageImage: String,
});

const workHistorySchema = new Schema({
  qoplarSoni: Number,
  date: String,
  qoplarSoni: Number,
  nonTuri: String,
  nonSoni: Number,
  bonus: [bonusBreadSchema],
  jastaNonSoni: Number,
  tulov: Number,
});

const attendaceSchema = new Schema({
  firstName: String,
  lastName: String,
  date: {
    type: Date,
    default: Date.now,
  },
  timeOfArrival: {
    type: String,
    default: () => {
      const currentTime = new Date();
      const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}`;
      return formattedTime;
    },
  },
  timeOfDeparture: {
    type: String,
    default: "00:00",
  },
  present: Boolean,
});

const staffFinesSchema = new Schema({
  fine: { type: String, enum: ["red", "green", "yellow"] },
  date: { type: Date },
  description: String,
});

const staffSchema = new Schema({
  firstName: String,
  lastName: String,
  responsibility: String,
  gender: String,
  phone: String,
  phone2: String,
  typeOfWorker: String,
  adress: String,
  group: String,
  birthday: String,
  smena: String,
  salary: Number,
  additionalSalary: { type: Number, default: 0 },
  image: String,
  workHistory: [workHistorySchema],
  AllsalaryHistory: [salarySchema],
  remainingDepts: { type: Number, default: 0 },
  fines: [staffFinesSchema],
});

const ordersSchema = new Schema({
  order: String,
  customer: String,
  productQuantity: Number,
  type: String,
  date: String,
  deadline: String,
  deadlineTime: String,
  time: String,
  phone: String,
  price: Number,
  status: String,
  delivery: Boolean,
});

const productExpensesSchema = new Schema({
  name: String,
  spent: Number,
});

const productsRequiredSchema = new Schema({
  itemName: String,
  itemQuantity: Number,
});

const nasiyaSchema = new Schema({
  product: String,
  customer: String,
  productQuantity: String,
  overall: Number,
  date: String,
  avans: Number,
  customerType: { type: String, enum: ["temporary", "daily"] },
  productID: String,
  userId: String,
  timeStamp: String,
});

const daromatSchema = new Schema({
  name: String,
  quantity: Number,
  overallPrice: Number,
  day: Number,
  month: Number,
  year: Number,
  timeStamp: Number,
});

const staffShareSchema = new Schema({
  type: String,
  share: Number,
});

const productsSchema = new Schema({
  productName: String,
  birQopUchunTulov: Number,
  breadPerBag: Number, /// bir qopdan chiqadigan non soni
  productPrice: Number,
  productImage: String,
  allExpensesPerBag: Number,
  productOverallExpense: Number,
  staffShare: { type: [staffShareSchema], default: [] },
  requiredItems: { type: [productsRequiredSchema], default: [] },
  others: {
    type: [productExpensesSchema],
    default: [],
  },
});

const dailyTasksSchema = new Schema({
  group: String,
  smena: String,
  xodim: [String],
  qoplarSoni: Number,
  nonTuri: String,
  nonSoni: Number,
  bonus: [bonusBreadSchema],
  jastaNonSoni: Number,
  tulov: Number,
  bonusTulov: Number,
  jamiTulov: Number,
  date: String,
});
const expensesSchema = new Schema({
  name: String,
  quantity: Number,
  customer: String,
  overallPrice: Number,
  day: Number,
  month: Number,
  year: Number,
  timeStamp: Number,
});

const xamkorPaymentSchema = new Schema({
  date: String,
  time: String,
  amount: Number,
});

const xamkorSchema = new Schema({
  firstName: String,
  lastName: String,
  phone: String,
  phone2: String,
  category: String,
  address: String,
  workPlace: String,
  position: String,
  paymentRequired: { type: Number, default: 0 },
  paymentHistory: {
    type: [xamkorPaymentSchema],
    default: [],
  },
});

const onSailSchema = new Schema({
  breadName: String,
  quantity: Number,
  imageUrl: String,
});
const plansSchema = new Schema({
  plan: String,
  deadline: String,
  person: String,
  date: String,
  status: String,
});

const access = new Schema({
  user: { type: String, unique: true, required: true },
  password: String,
  accessables: [String],
});

const dailyReportSchema = new Schema({
  bread: String,
  qoplarSoni: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

/* middlewares*/

storeMax20(xamkorSchema);
// keeps last 3 months
attandanceModify(attendaceSchema);

const StaffModel = mongoose.model("staff", staffSchema);
const DailyReport = mongoose.model("dailyReport", dailyReportSchema);
const Users = mongoose.model("users", usersSchema);
// all exports here

module.exports = {
  customersSchema,
  storageSchema,
  staffSchema,
  ordersSchema,
  productsSchema,
  dailyTasksSchema,
  expensesSchema,
  onSailSchema,
  nasiyaSchema,
  daromatSchema,
  xamkorSchema,
  plansSchema,
  access,
  attendaceSchema,
  StaffModel,
  DailyReport,
  Users,
};
