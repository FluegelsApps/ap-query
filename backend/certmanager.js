const openssl = require("openssl-nodejs");
const { isValidSSL } = require("ssl-validator");
const fs = require("fs");

const keyPath = "openssl/ssl_key.pem";
const certPath = "openssl/ssl_certificate.crt";

module.exports = {
  generateCertificate: (callback) => {
    let buffer = fs.readFileSync("./openssl/configuration.conf");

    console.log("Generating SSL certificate");
    openssl(
      [
        "req",
        "-config",
        { name: "configuration.conf", buffer: buffer },
        "-x509",
        "-newkey",
        "rsa:4096",
        "-keyout",
        keyPath.replace("openssl/", ""),
        "-out",
        certPath.replace("openssl/", ""),
        "-sha256",
        "-days",
        "365",
        "-nodes",
        "-subj",
        "/CN=Aruba Power Monitor/O=FluegelsApps/C=DE",
        "-extensions",
        "v3_req",
      ],
      (error, buffer) => callback()
    );
  },
  isCertificateValid: async () => {
    return await isValidSSL(module.exports.loadCertificate());
  },
  certAndKeyExist: () => {
    return fs.existsSync(keyPath) && fs.existsSync(certPath);
  },
  loadKey: () => {
    return fs.readFileSync(keyPath, "utf8");
  },
  loadCertificate: () => {
    return fs.readFileSync(certPath, "utf8");
  },
};
