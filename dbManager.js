const mysql = require("mysql2");
const settings = require('./settings');
  
const connection = mysql.createConnection({
  host: settings.dbHost,
  user: settings.dbUser,
  database: settings.dbName,
  password: settings.dbPassword
});


const getLastEntry = (userID, entriesCount = 1, cb) => {
    connection.query(
        "SELECT * FROM fuel WHERE user_id = ? ORDER BY id DESC LIMIT ?",
        [userID, entriesCount],
        function(error, results, fields) {
            if (error) throw error;

            cb(results.length ? results : null);
    });
}

const addFuelEntry = (userID, odometer, fuelAmount, price) => {
    let entry  = {
        user_id: userID,
        odometer: odometer,
        fuel_amount: fuelAmount,
        price: price,
    };
    connection.query(
        'INSERT INTO fuel SET ?',
        entry,
        function (error, results, fields) {
        if (error) throw error;

        getLastEntry(userID, 2, calcConsumption)
    });
}

const calcConsumption = (entries) => {
    if (entries && entries.length == 2) {
        let [lastEntry, beforeLastEntry] = entries;
        if (lastEntry.odometer && beforeLastEntry.odometer) {
            let odometerDiff = lastEntry.odometer - beforeLastEntry.odometer;
            let consumption = (lastEntry.fuel_amount * 100)/odometerDiff;
    
            connection.query(
                'UPDATE fuel SET consumption=? WHERE id=?',
                [consumption, lastEntry.id],
                function (error, results, fields) {
                if (error) throw error;
            });
        }
    }
}

module.exports = {connection, addFuelEntry, getLastEntry};
