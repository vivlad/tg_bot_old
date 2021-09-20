const http = require('http');
const settings = require('./settings');

const mcuQuery = (endpoint, cb) => {
  http.get(`http://${settings.mcuIP}/${endpoint}`, (resp) => {
    var data = '';
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => { cb(data.trim()); });
  }).on("error", (err) => { console.log( "Error: " + err.message ); });
}

//examples
//mcuQuery('sensor/temp', data => console.log(data));
//endpoints:
//sensor/hum
//io/pin5/on
//io/pin5/off
//io/pin6/on
//io/pin6/off

module.exports = mcuQuery;
