const measurementsDatabasePath = "measurements.sqlite";
const fs = require("fs");
const db = require("sql.js");

let measurementsDatabase;

module.exports = {
  initialize: function () {
    /**
     * Data structure:
     * Timestamp
     * AP Name
     * AP IP-Address
     * Current value in mW
     * Average value in mW
     * Minimum value in mW
     * Maximum value in mW
     */

    db().then(function (SQL) {
      measurementsDatabase = fs.existsSync(measurementsDatabasePath)
        ? new SQL.Database(fs.readFileSync(measurementsDatabasePath))
        : new SQL.Database();
      measurementsDatabase.run(
        "CREATE TABLE IF NOT EXISTS measurements (timestamp long, ap string, apip string, current int, average int, minimum int, maximum int);"
      );
    });
  },
  saveInternal: function () {
    fs.writeFileSync(
      measurementsDatabasePath,
      new Buffer(measurementsDatabase.export())
    );
  },
  getMeasurements: function () {
    const fetchStatement = measurementsDatabase.prepare(
      "SELECT * FROM measurements"
    );
    fetchStatement.getAsObject();
    fetchStatement.bind();

    let measurements = "[\n";
    while (fetchStatement.step())
      measurements =
        measurements + JSON.stringify(fetchStatement.getAsObject()) + ",";
    measurements = measurements.substring(0, measurements.length - 1) + "\n]";
    return measurements;
  },
  downloadMeasurements: function (accessPoints) {
    let condition = "";
    for (let i = 0; i < accessPoints.length; i++)
      condition = condition + `ap = '${accessPoints[i]}' OR `;
    condition = condition.substring(0, condition.length - 4);

    const downloadStatement = measurementsDatabase.prepare(
      `SELECT * FROM measurements WHERE ${condition}`
    );
    downloadStatement.getAsObject();
    downloadStatement.bind();

    let measurements = "";
    let part = "";
    while (downloadStatement.step()) {
      part = JSON.stringify(downloadStatement.getAsObject())
        .replaceAll("{", "")
        .replaceAll("}", "");
      let contentParts = part.split(",");

      let finalPart = "";
      for (let i = 0; i < contentParts.length; i++) {
        let innerParts = contentParts[i].split(":");
        part = contentParts[i].replace(innerParts[0] + ":", "");

        if (i == 0) {
          let date = new Date(parseInt(part));
          part = `"${formatTime(date.getHours())}:${formatTime(
            date.getMinutes()
          )}:${formatTime(date.getSeconds())} - ${formatTime(
            date.getDay()
          )}.${formatTime(date.getMonth())}.${date.getFullYear()}"`;
        }

        if (i > 2) part = '"' + part + ' mW"';

        if (i <= 5) part = part + ",";
        finalPart = finalPart + part;
      }

      measurements = measurements + finalPart + "\n";
    }

    return (
      '"Timestamp","Access Point Name","Access Point IP-Address","Current Power","Average Power","Minimum Power","Maximum Power"\n' +
      measurements
    );
  },
  insertMeasurement: function (
    timestamp,
    ap,
    apip,
    current,
    average,
    minimum,
    maximum
  ) {
    measurementsDatabase.run(
      `INSERT INTO measurements VALUES (${timestamp}, '${ap}', '${apip}', ${current}, ${average}, ${minimum}, ${maximum});`
    );
    this.saveInternal();
  },
  deleteMeasurements: function () {
    measurementsDatabase.run("DELETE FROM measurements");
    this.saveInternal();
  },
};

function formatTime(time) {
  if (time < 10) return `0${time}`;
  else return time;
}
