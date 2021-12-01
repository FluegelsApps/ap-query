const web_server = require("./web_server.js");
const config = require("./backend/config.js");
const measurements = require("./backend/measurements.js");
const certmanager = require("./backend/certmanager.js");

config.initialize();
measurements.initialize();

if (!certmanager.certAndKeyExist() || !certmanager.isCertificateValid()) {
    console.log("Certificate not available");
    certmanager.generateCertificate(() => web_server.launch());
} else {
    console.log("Launching web server");
    web_server.launch();
}
