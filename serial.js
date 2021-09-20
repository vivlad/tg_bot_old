const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const fs = require('fs')
var sys = require('util')
var exec = require('child_process').exec;

const serialListener = (cb) => {
    try {
        let path = '/dev/'
        //get arduino device from devises list
        const regex = new RegExp('(ttyUSB.)');
        exec("dmesg | grep FTDI | grep ttyUSB", function(err, stdout, stderr) {
            let port = regex.exec(stdout)[0];
            path += port;
            if (fs.existsSync(path)) {
              console.log('Enabling listener for ' + path)
              const port = new SerialPort(path, { baudRate: 9600 })
              const parser = new Readline()
              port.pipe(parser)
              parser.on('data', line => cb(line))
            } else {
              console.error('Unable to connect to the serial')
            }
        });
      } catch(err) {
        console.error(err)
      }
}

module.exports = serialListener