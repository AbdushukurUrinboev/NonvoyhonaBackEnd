// Importing;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const SharpMulter = require("sharp-multer");
const app = express();
const multer = require('multer');
require('dotenv').config()
mongoose.pluralize(null);

// routes
const {
    customers: getCustomersRoute,
    addCustomers: postCustomersRoute,
    deleteCustomer: deleteCustomerRoute,
    updateCustomer: updateCustomerRoute,
    getSpecificCustomer,
    getTypeOfCustomers
} = require("./routes/customers");
const {
    storage,
    addProduct,
    deleteProduct,
    updateProduct,
    getSpecificStorage
} = require("./routes/storage");
const {
    staff,
    addNewStaff,
    deleteStaff,
    updateStaff,
    specificStaff,
    addSalary
} = require("./routes/staff");
const {
    orders,
    addOrder,
    deleteOrder,
    updateOrder,
    oneOrder
} = require("./routes/orders");
const {
    goods,
    updateGood,
    deleteGood,
    addGood,
    oneGood
} = require("./routes/products");
const {
    tasks,
    addTask,
    deleteTask,
    updateTask
} = require("./routes/daily-task");
const {
    onSail,
    sellToCustomer,
    deleteSail,
    updateSail
} = require("./routes/on-sale");
const {
    nasiya,
    addNasiya,
    updateNasiya,
    deleteNasiya,
    reportNasiya,
    oneNasiya
} = require("./routes/nasiya");
const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    reportExpenses,
    getIndividualExpense
} = require("./routes/expenses");
const {
    daromat,
    reportDaromat,
    deleteDaromat,
    updateDaromat,
    reportDaromatPerProduct
} = require("./routes/daromat");
const {
    xamkor,
    addXamkor,
    updateXamkor,
    deleteXamkor,
    oneXamkor
} = require("./routes/xamkor");
const {
    plans,
    addPlan,
    deletePlan,
    updatePlan,
    onePlan
} = require("./routes/plans");



// PORT
const port = process.env.PORT;
// setting Up
mongoose.set('strictQuery', true);
const storageForImg = SharpMulter({
    destination: (req, file, cb) => {
        if (req.route.path === "/staff") {
            cb(null, "./uploads/staffImage");
        } else if (req.route.path === "/storage") {
            cb(null, "./uploads/storage");
        } else {
            cb(null, "./uploads/productImage");
        }
    },
    imageOptions: {
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 500,
            height: 500
        },
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({
    storage: storageForImg
});
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept-Type"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(cors());

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/NonvoyhonaDB');
}

mongoose.connection.on("open", function (ref) {
    console.log("Connected to mongo server.");
});

// Handle Customers
app.route('/customers')
    .get(getCustomersRoute)
    .post(postCustomersRoute)
    .delete(deleteCustomerRoute)
    .put(updateCustomerRoute);

app.get('/customer/:id', getSpecificCustomer)
app.get('/customers/:type', getTypeOfCustomers) ///// customertype

// Handle Storage
app.route('/storage')
    .get(storage)
    .post(upload.single('storageImage'), addProduct)
    .delete(deleteProduct)
    .put(upload.single('storageImage'), updateProduct);  // update with image must be added to all 


app.get('/storage/:id', getSpecificStorage);

// Handle Staff
app.route('/staff')
    .get(staff)
    .post(upload.single('image'), addNewStaff)
    .delete(deleteStaff)
    .put(upload.single('image'), updateStaff);

app.route('/staff/:id')
    .get(specificStaff)
    .post(addSalary)

// Handle Orders

app.route('/order/:id')
    .get(oneOrder)

app.route('/orders')
    .get(orders)
    .post(addOrder)
    .delete(deleteOrder)
    .put(updateOrder);

// Handle Calculation

app.route('/calculation/:id')
    .get(oneGood);

app.route('/calculation')
    .get(goods)
    .post(upload.single('productImage'), addGood)
    .delete(deleteGood)
    .put(upload.single('productImage'), updateGood);

// Handle xamkor

app.route('/xamkor/:id')
    .get(oneXamkor)

app.route('/xamkor')
    .get(xamkor)
    .post(addXamkor)
    .delete(deleteXamkor)
    .put(updateXamkor);

app.route('/plan/:id')
    .get(onePlan);

app.route('/plans')
    .get(plans)
    .post(addPlan)
    .delete(deletePlan)
    .put(updatePlan);

// Handle Calculation

app.route('/daily-tasks')
    .post(addTask)

// Handle Sotuv

app.route('/sale')
    .get(onSail)
    .post(sellToCustomer) // this is where the object in either sales or orders gets removed
    .delete(deleteSail)
    .put(updateSail);

// Handle Nasiya

app.route('/nasiya/:id')
    .get(oneNasiya)

app.route('/nasiya')
    .get(nasiya)
    .post(addNasiya)
    .delete(deleteNasiya)
    .put(updateNasiya);

// Handle Expenses

app.route('/expenses')
    .get(expenses)
    .post(addExpense)
    .delete(deleteExpense)
    .put(updateExpense);

app.route('/expenses/:id')
    .get(getIndividualExpense)

app.route('/daromat')
    .get(daromat)
    .delete(deleteDaromat)
    .put(updateDaromat);


// HomePageReport
app.get('/report/expenses', reportExpenses);
app.get('/report/nasiya', reportNasiya);
app.get('/report/daromat', reportDaromat);
app.get('/report/daromat/:productName', reportDaromatPerProduct);


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});