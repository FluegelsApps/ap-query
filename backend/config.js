const configurationDatabasePath = "configuration.sqlite";
const fs = require("fs");
const db = require("sql.js");

let configurationDatabase;

module.exports = {
  initialize: function () {
    /**
     * Data structure:
     * Primary key
     * Host address
     * Username
     * Password
     * Status
     * State
     * Query Interval
     * Enable Power Monitoring
     * Enable GPS Monitoring
     */

    db().then(function (SQL) {
      //Initializing the database
      configurationDatabase = fs.existsSync(configurationDatabasePath)
        ? new SQL.Database(fs.readFileSync(configurationDatabasePath))
        : new SQL.Database();
      configurationDatabase.run(
        "CREATE TABLE IF NOT EXISTS configuration (key int, host string, user string, password string, status string, state int, queryInterval int, powerMonitoring boolean, gpsMonitoring boolean);"
      );

      const initializeStatement = configurationDatabase.prepare(
        "SELECT * FROM configuration;"
      );
      initializeStatement.getAsObject();
      initializeStatement.bind();

      while (initializeStatement.step())
        configurationDatabase.run(
          `UPDATE configuration SET status = 'Offline', state = 0 WHERE host = '${initializeStatement.getAsObject().host}';`
        );
    });
  },
  saveInternal: function () {
    fs.writeFileSync(
      configurationDatabasePath,
      new Buffer(configurationDatabase.export())
    );
  },
  getConfiguration: function () {
    const fetchStatement = configurationDatabase.prepare(
      "SELECT * FROM configuration;"
    );
    fetchStatement.getAsObject();
    fetchStatement.bind();

    let configuration = "[\n";
    while (fetchStatement.step()) {
      let instance = fetchStatement.getAsObject();
      configuration = configuration + JSON.stringify(instance).replace(`"password":"${instance.password},"`) + ",";
    }

    configuration =
      configuration.substring(0, configuration.length - 1) + "\n]";
    return configuration;
  },
  getConfigurationAmount: function () {
    return this.getConfiguration().split("\n").length - 2;
  },
  insertConfiguration: function (
    host,
    user,
    password,
    queryInterval,
    powerMonitoring,
    gpsMonitoring
  ) {
    configurationDatabase.run(
      `INSERT INTO configuration VALUES (${this.getConfigurationAmount()}, '${host}', '${user}', '${password}', "Offline", 0, ${queryInterval}, ${powerMonitoring}, ${gpsMonitoring});`
    );
    this.saveInternal();
  },
  removeConfiguration: function (host) {
    configurationDatabase.run(
      `DELETE FROM configuration WHERE host = '${host}';`
    );
    this.saveInternal();
  },
  updateConfiguration: function (update) {
    configurationDatabase.run(
      `UPDATE configuration SET host = '${update.host}', user = '${update.username}', password = '${update.password}', queryInterval = ${update.queryInterval}, powerMonitoring = ${update.powerMonitoring}, gpsMonitoring = ${update.gpsMonitoring} WHERE host = '${update.oldhost}';`
    );
    this.saveInternal();
  },
  updateConfigurationStatus: function (update) {
    configurationDatabase.run(
      `UPDATE configuration SET status = '${update.status}', state = ${update.state} WHERE host = '${update.oldhost}';`
    );
    this.saveInternal();
  },
  requestConfiguration: function (host) {
    const fetchStatement = configurationDatabase.prepare(
      `SELECT * FROM configuration WHERE host = '${host}';`
    );
    fetchStatement.getAsObject();
    fetchStatement.bind();

    let configuration;
    while (fetchStatement.step())
      configuration = JSON.stringify(fetchStatement.getAsObject());
    return configuration;
  },
};
