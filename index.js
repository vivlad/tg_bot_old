"use strict";
const TelegramBot = require('node-telegram-bot-api');
const settings = require('./settings');
const mcuQuery = require("./mcuQuery");
const serialListener = require("./serial");

// replace the value below with the Telegram token you receive from @BotFather
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(settings.telegramToken, {polling: true});
 
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
            [{ text: 'Another feature' }],
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

bot.onText(/Another feature/i, (msg, match) => {
    let message = 'test';
    message += msg.chat.id;
    message += '\r\n';
    bot.sendMessage(msg.chat.id, message);
});

serialListener(data => {
    data = parseInt(data.trim())
    if(data === 0) {
        bot.sendMessage(settings.subscriber, 'Door was opened');
    }
})
