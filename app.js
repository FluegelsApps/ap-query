const web_server = require("./web_server.js");
const config = require("./backend/config.js");
const measurements = require("./backend/measurements.js");

web_server.launch();
config.initialize();
measurements.initialize();