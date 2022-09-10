const powerMonitoringCommand = `show aps power-monitor\n`;
const powerMonitoringCommandShort = `show aps power-monitor`;
const powerMonitoringResultTableHeader = "Name";
const powerMonitoringResultHeader = "AP Power Monitoring information";

const gpsMonitoringCommand = `show ap gps advanced\n`;
const gpsMonitoringCommandShort = `show ap gps advanced`;
const gpsMonitoringResultHeader = `$GNGGA`;

const ssh2 = require("ssh2");
const os = require("os");

const measurements = require("./measurements.js");
const config = require("./config.js");
const { timeStamp } = require("console");

var connections = [];

const status_offline = 0;
const status_pending = 1;
const status_online = 2;

module.exports = {
  startConnection: function (configuration, socket) {
    let newConnection = new SSHConnection(
      configuration.host,
      configuration.user,
      configuration.password,
      configuration.queryInterval,
      configuration.powerMonitoring,
      configuration.gpsMonitoring
    );
    newConnection.connect(socket);
    connections.push(newConnection);
  },
  stopConnection: function (configuration, socket) {
    if (this.hasConnection(configuration.host)) {
      let index = this.findConnectionIndex(configuration.host);
      connections[index].disconnect(socket);
      connections.splice(this.findConnectionIndex(configuration.host), 1);
    }
  },
  getConnectionStats: function (host) {
    if (this.hasConnection(host))
      return connections[this.findConnectionIndex(host)].getStatistics();
  },
  hasConnection: function (host) {
    return this.findConnection(host) != null;
  },
  findConnectionIndex: function (host) {
    for (let i = 0; i < connections.length; i++)
      if (connections[i].host == host) return i;

    return -1;
  },
  findConnection: function (host) {
    for (let i = 0; i < connections.length; i++)
      if (connections[i].host == host) return connections[i];

    return null;
  },
};

class SSHConnection {
  currentConnection = new ssh2.Client();
  status = status_offline;
  timerId = 0;
  connected = false;

  stats_started = new Date().getTime();
  stats_measures = 0;
  stats_nextmeasure = new Date().getTime();

  constructor(host, username, password, queryInterval, powerMonitoring, gpsMonitoring) {
    this.host = host;
    this.username = username;
    this.password = password;
    this.queryInterval = queryInterval;
    this.powerMonitoring = powerMonitoring;
    this.gpsMonitoring = gpsMonitoring;
  }

  connect = (io) => {
    config.updateConfigurationStatus({
      oldhost: this.host,
      status: "Connecting",
      state: 1,
    });
    io.emit("notify_configdb_updated", config.getConfiguration());

    let Client = ssh2.Client;
    this.currentConnection = new Client();

    var credentials = {
      host: this.host,
      username: this.username,
      password: this.password,
      tryKeyboard: true,
    };

    this.status = status_pending;

    // Copy variables for internal use
    const timerInterval = this.queryInterval;
    const powerMonitoringCallback = this.onPowerMonitoringResponse;
    const gpsMonitoringCallback = this.onGPSMonitoringResponse;
    const usePowerMonitoring = this.powerMonitoring;
    const useGPSMonitoring = this.gpsMonitoring;

    console.log("Establishing connection to " + this.host);

    this.currentConnection
      .on("ready", function () {
        console.log("Connection ready");
        this.shell((err, stream) => {
          stream.on("data", function (data) {
            if (!this.connected) {
              this.status = status_online;
              this.connected = true;
              this.stats_started = new Date().getTime();
              this.stats_nextmeasure = new Date(new Date().getTime() + 60000).getTime();

              config.updateConfigurationStatus({
                oldhost: credentials.host,
                status: "Connected",
                state: 1,
              });
              io.emit("notify_configdb_updated", config.getConfiguration());

              this.timerId = setInterval(() => {
                if (usePowerMonitoring) stream.write(powerMonitoringCommand);
                if (useGPSMonitoring) stream.write(gpsMonitoringCommand);
              }, timerInterval);
            } else {
              let content = data.toString().split(os.EOL);

              for (var i = 0; i < content.length; i++) {
                if (content[i].includes(powerMonitoringResultHeader)) {
                  powerMonitoringCallback(io, content, i);
                  break;
                } else if (content[i].includes(powerMonitoringResultTableHeader)) {
                  powerMonitoringCallback(io, content, i + 2);
                  break;
                } else if (content[i].includes(gpsMonitoringResultHeader)) {
                  gpsMonitoringCallback(io, content, i);
                  break;
                }
              }
            }
          });
        });
      })
      .on("error", (error) => {
        config.updateConfigurationStatus({
          oldhost: credentials.host,
          status: "Error",
          state: 0,
        });
        io.emit("notify_configdb_updated", config.getConfiguration());
        io.emit(
          "notify_exception",
          JSON.stringify({
            instance: error,
            origin: `Client: ${credentials.host}`,
          })
        );

        console.log("Error occurred: " + JSON.stringify(error));
      })
      .connect(credentials);
  }

  disconnect(io) {
    clearInterval(this.timerId);
    this.currentConnection.end();

    config.updateConfigurationStatus({
      oldhost: this.host,
      status: "Offline",
      state: 0,
    });
    io.emit("notify_configdb_updated", config.getConfiguration());
  }

  onPowerMonitoringResponse(io, content, startIndex) {
    console.log("Power Monitoring Response Received");
    for (var i = startIndex; i < content.length - 1; i++) {
      if (!content[i].includes(powerMonitoringCommandShort)) {
        //Remove double whitespaces from the string
        let adjustedData = "";
        let recentWhitespace = false;
        for (let a = 0; a < content[i].length; a++) {
          if (content[i][a] === " ") {
            if (!recentWhitespace) {
              recentWhitespace = true;
              adjustedData = adjustedData + content[i][a];
            }
          } else {
            recentWhitespace = false;
            adjustedData = adjustedData + content[i][a];
          }
        }

        let data = adjustedData.split(" ");
        if (data.length == 6) {
          this.stats_measures++;
          this.stats_nextmeasure = new Date(new Date().getTime() + 60000).getTime();

          //Adding the actual content
          measurements.insertMeasurement(
            new Date().getTime(),
            data[0],
            data[1],
            data[2],
            parseInt(data[3]),
            parseInt(data[4]),
            parseInt(data[5])
          );
          io.emit(
            "notify_measurements_updated",
            measurements.getMeasurements()
          );
        }
      }
    }
  }

  onGPSMonitoringResponse(io, content, startIndex) {
    console.log("GPS Monitoring Response Received");
  }

  getStatistics() {
    return {
      host: this.host,
      status: this.status,
      started: this.stats_started,
      measures: this.stats_measures,
      nextmeasure: this.stats_nextmeasure
    };
  }
}
