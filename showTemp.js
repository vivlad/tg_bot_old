const mcuQuery = require("./mcuQuery");

mcuQuery("sensor/temp", data => console.log(data));
