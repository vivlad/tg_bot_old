"use strict";
const TelegramBot = require('node-telegram-bot-api');
const settings = require('./settings');
const mcuQuery = require("./mcuQuery");
const serialListener = require("./serial");
const dbManager = require("./dbSequelize");

// replace the value below with the Telegram token you receive from @BotFather
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(settings.telegramToken, {polling: true});
dbManager.connection.connect();
 
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
 
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
 
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/start/i, (msg, match) => {
    const options = {
        reply_markup: JSON.stringify({
            keyboard: [
            [{ text: '📟 Show sensors data' }],
            [{ text: '⛽ Add fuel entry' }],
            [{ text: '🚗 Car logs' }],
            ]
        })
    };
  
    bot.sendMessage(msg.chat.id, 'Choose action:', options);
});

bot.onText(/Show sensors data/i, (msg, match) => {
    mcuQuery("sensor/temp", temp => {
        let message = "🌡️ Temp: " + temp + " C; ";
        mcuQuery("sensor/hum", hum => {
            message += "🌧️ Hum: " + hum;
            bot.sendMessage(msg.chat.id, message);
        });
    });
});

bot.onText(/Add fuel entry/i, (msg, match) => {
    let message = 'Please input "odometer;fuel amout; price"';
    bot.sendMessage(msg.chat.id, message);
});

bot.onText(/(\d.+);(\d.+);(\d.+)/i, (msg, match) => {
    let odometer = parseInt(match[1]);
    let fuel = parseFloat(match[2]);
    let price = parseFloat(match[3]);
    let message = `🔢: ${odometer}; ⛽: ${fuel}; 💲: ${price};`;
    dbManager.addFuelEntry(msg.chat.id, odometer, fuel, price);
    bot.sendMessage(msg.chat.id, message);
});

bot.onText(/Car logs/i, (msg, match) => {
    dbManager.getLastMonthData(msg.chat.id, (data) => {
        let preparedData = data ? data.reduce((acc, entry) => {
                acc.totalFuelAmount += entry.fuelAmount;
                acc.totalCost += entry.fuelAmount * entry.price;
                acc.summaryConsumption += entry.consumption;
            },
            {
                totalFuelAmount: 0,
                totalCost: 0,
                summaryConsumption: 0,
            }
        ) : null;
        let message = '';
        if (null !== preparedData) {
            preparedData['avgConsumption'] = preparedData.summaryConsumption/data.length;
            preparedData['lastConsumption'] = data[data.length-1].consumption;
            preparedData['odometer'] = data[data.length-1].odometer - data[0].odometer;
            preparedData['count'] = data.length;
            message += `Count: ${preparedData.count}\\r\\n`;
            message += `Latest 💯: ${preparedData.lastConsumption}\\r\\n`;
            message += `🔢: ${preparedData.odometer}; ⛽: ${preparedData.totalFuelAmount};\\r\\n`;
            message += `💲: ${preparedData.totalCost}; AVG/💯: ${preparedData.avgConsumption}\\r\\n`;
        }

        bot.sendMessage(msg.chat.id, message);
    })
});

serialListener(data => {
    data = parseInt(data.trim())
    if(data === 0) {
        bot.sendMessage(settings.subscriber, 'Door was opened');
    }
})
