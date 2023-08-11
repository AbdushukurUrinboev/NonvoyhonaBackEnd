const mongoose = require('mongoose');

const storeMax20 = (schema) => {
    schema.pre('save', function (next) {
        const maxHistoryLength = 20; // Define your desired maximum length for the history array
        // If the history array has reached the maximum length, remove the first string
        if (this.paymentHistory.length >= maxHistoryLength) {
            this.paymentHistory.shift();
        }

        next();
    });
}
const attandanceModify = (schema) => {
    schema.pre('save', function (next) {
        // Get the current date
        const currentDate = new Date();

        // Set the date property to the current date
        this.date = currentDate;

        // Calculate the date 3 months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        // Apply the filter to store only the last 3 months of data
        this.constructor.deleteMany({ date: { $lt: threeMonthsAgo } }, function (err) {
            if (err) {
                console.error(err);
            }
            next();
        });
    });
}



module.exports = {
    storeMax20,
    attandanceModify
};