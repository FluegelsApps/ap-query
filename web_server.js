const https = require("https");
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const ssh = require("./backend/ssh.js");
const certmanager = require("./backend/certmanager.js");

const config = require("./backend/config.js");
const measurements = require("./backend/measurements.js");
const gps = require("./backend/gps.js");

const command_insert_configuration = "insert_configuration";
const command_remove_configuration = "remove_configuration";
const command_update_configuration = "update_configuration";

const command_start_connection = "start_connection";
const command_stop_connection = "stop_connection";
const command_delete_measurements = "delete_measurements";
const command_replace_measurements = "replace_measurements";
const command_delete_gps_data = "delete_gps_data";

const notify_configuration_update = "notify_configdb_updated";
const notify_measurements_update = "notify_measurements_updated";
const notify_gps_update = "notify_gps_updated";

const request_configuration_data = "request_configdb_data";
const request_export_data = "request_exportdb_file";
const request_session_information = "request_session_info";
const request_export_gps_csv = "request_gps_monitoring_exportdb_csv";
const request_export_gps_raw = "request_gps_monitoring_exportdb_raw";

const response_configuration_data = "response_configdb_data";
const response_export_data = "response_exportdb_file";
const response_session_information = "response_session_info";
const response_export_gps_csv = "response_gps_monitoring_exportdb_csv";
const response_export_gps_raw = "response_gps_monitoring_exportdb_raw";

module.exports = {
  launch: function () {
    const server = https.createServer(
      { key: certmanager.loadKey(), cert: certmanager.loadCertificate() },
      app
    );
    const io = new Server(server);

    //Web Page
    app.get("/", (req, res) => {
      res.contentType = "text/html";
      res.sendFile(__dirname + "/frontend-old/index.html");
    });
    app.get("/dashboard", (req, res) => {
      res.redirect("/");
    });
    app.get("/frontend.js", (req, res) => {
      res.contentType = "text/javascript";
      res.sendFile(__dirname + "/frontend-old/frontend.js");
    });
    app.get("/main.css", (req, res) => {
      res.contentType = "text/css";
      res.sendFile(__dirname + "/frontend-old/main.css");
    });

    //API Access
    app.get("/api/", (req, res) => {
      res.send("<h1>Power Measurement API</h1>");
    });
    app.get("/api/data", (req, res) => {
      res.send(measurements.getMeasurements());
    });

    app.get("*", (req, res) => {
      res.contentType = "text/html";
      res.sendFile(__dirname + "/frontend-old/notfound.html");
    });

    io.on("connection", (socket) => {
      //The user connected successfully
      socket.emit(notify_configuration_update, config.getConfiguration());
      socket.emit(notify_measurements_update, measurements.getMeasurements());
      socket.emit(notify_gps_update, gps.getGPSData());

      socket.on(command_insert_configuration, function (rawConfiguration) {
        let configuration = JSON.parse(rawConfiguration);
        console.log(configuration);

        config.insertConfiguration(
          configuration.host,
          configuration.username,
          configuration.password,
          configuration.queryInterval,
          configuration.powerMonitoring,
          configuration.gpsMonitoring
        );
        io.emit(notify_configuration_update, config.getConfiguration());
      });

      socket.on(command_remove_configuration, function (host) {
        config.removeConfiguration(host);
        io.emit(notify_configuration_update, config.getConfiguration());
      });

      socket.on(command_update_configuration, function (update) {
        config.updateConfiguration(JSON.parse(update));
        io.emit(notify_configuration_update, config.getConfiguration());
      });

      socket.on(command_start_connection, function (data) {
        ssh.startConnection(data, io);
      });

      socket.on(command_stop_connection, function (data) {
        ssh.stopConnection(data, io);
      });

      socket.on(command_delete_measurements, function (args) {
        measurements.deleteMeasurements();
        socket.emit(notify_measurements_update, measurements.getMeasurements());
      });

      socket.on(command_replace_measurements, function (data) {
        measurements.replaceMeasurements(data);
        socket.emit(notify_measurements_update, measurements.getMeasurements());
      });

      socket.on(command_delete_gps_data, function (args) {
        gps.deleteGPS();
        socket.emit(notify_gps_update, gps.getGPSData());
      });

      socket.on(request_configuration_data, function (host) {
        socket.emit(
          response_configuration_data,
          config.requestConfiguration(host)
        );
      });

      socket.on(request_export_data, function (accessPoints) {
        socket.emit(
          response_export_data,
          measurements.downloadMeasurements(JSON.parse(accessPoints))
        );
      });

      socket.on(request_session_information, function (host) {
        socket.emit(response_session_information, JSON.stringify(ssh.getConnectionStats(host)));
      });

      socket.on(request_export_gps_csv, function (accessPoints) {
        socket.emit(
          response_export_gps_csv,
          gps.downloadGPS(JSON.parse(accessPoints))
        );
      });

      socket.on(request_export_gps_raw, function (accessPoints) {
        socket.emit(
          response_export_gps_raw,
          gps.downloadGPSRaw(JSON.parse(accessPoints))
        );
      });
    });

    server.listen(8000, () => {
      console.log("Server listening on port 8000");
    });

    server.on("close", function (event) {
      console.log("Server on port 8000 was closed");
    });
  },
};
