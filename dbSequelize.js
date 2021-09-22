const { Sequelize, Op } = require('sequelize')
const settings = require('./settings');
const moment = require('moment');

const sequelize = new Sequelize(settings.dbName, settings.dbUser, settings.dbPassword, {
    dialect: settings.dbDialect,
    host: settings.dbHost
});

const Fuel = sequelize.define('fuel', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
    },
    updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
    },
    odometer: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    fuelAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    consumption: {
        type: Sequelize.FLOAT,
        allowNull: true,
    }
});

const dbSync = (force = false) => {
    sequelize.sync({force: force}).then(result => {
        console.log(result);
    }).catch(err=> console.log(err));
}

const addFuelEntry = (userID, odometer, fuelAmount, price) => {
    Fuel.create({
        userId: userID,
        odometer: odometer,
        fuelAmount: fuelAmount,
        price: price,
    }).then( res => {
        getLastEntry(userID, 2, calcConsumption);
    }).catch(err => console.log(err));
}

const getLastEntry = (userID, entriesCount = 1, cb) => {
    Fuel.findAll({where: {userId: userID}, limit: entriesCount, order: [['id', 'DESC']], raw:true})
        .then(results => {
            if(!results) return null;
            cb(results);
        }).catch(err => console.log(err));
}

const calcConsumption = (entries) => {
    if (entries && entries.length === 2) {
        let [lastEntry, beforeLastEntry] = entries;
        if (lastEntry.odometer && beforeLastEntry.odometer) {
            let odometerDiff = lastEntry.odometer - beforeLastEntry.odometer;
            let consumption = (lastEntry.fuelAmount * 100)/odometerDiff;

            Fuel.update({consumption: consumption }, {
                where: {
                    id: lastEntry.id
                }
            }).then((res) => {
            }).catch(err => console.log(err));
        }
    }
}

const getLastMonthData = (userID, cb) => {
    Fuel.findAll({
        where: {
            userId: userID,
            createdAt: {
                [Op.gte]: moment().subtract(30, 'days').toDate(),
            },
        },
        raw:true
    }).then(results => {
        if(!results) return null;
        cb(results);
    }).catch(err => console.log(err));
}

module.exports = {addFuelEntry, getLastEntry, getLastMonthData};