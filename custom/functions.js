exports.getDatesInRange = function (startDate, endDate, data) {
    // Iterate from the start date to the end date
    let newStartDate = new Date(startDate);
    let newEndDate = new Date(endDate);
    let filteredByDate = data.filter((eachObj) => {
        const objectDate = `${eachObj.year}-${eachObj.month.toString().padStart(2, '0')}-${eachObj.day.toString().padStart(2, '0')}`
        let foundDate = new Date(objectDate);

        console.log(newStartDate);
        console.log(foundDate);
        if (foundDate <= newEndDate && foundDate >= newStartDate) {
            return true;
        } else {
            return false;
        }
    });

    // Return the array of dates
    return filteredByDate;
}

exports.reportDataInRange = async (startDate, endDate, collection) => {
    let newStartDate = new Date(startDate);
    let newEndDate = new Date(endDate);
    const data = await collection.find({});

    let filteredByDate = data.filter((eachObj) => {
        let [currDay, currMonth, currYear] = eachObj.date.split("/").map(Number);
        const objectDate = `${currYear}-${currMonth.toString().padStart(2, '0')}-${currDay.toString().padStart(2, '0')}`
        let foundDate = new Date(objectDate);
        if (foundDate <= newEndDate && foundDate >= newStartDate) {
            return true;
        } else {
            return false;
        }
    });

    // Return the array of dates
    return filteredByDate;
}