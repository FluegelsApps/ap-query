const gpsDatabasePath = "gps.sqlite"
const fs = require("fs")
const db = require("sql.js")

let gpsDatabase

module.exports = {
    initialize: function () {
        /**
         * Data structure:
         * Timestamp
         * Latitude
         * North or South
         * Longitude
         * East or West
         * Quality Indicator
         * Number of Satellites
         * Horizontal Dilution
         * Antenna Altitude
         * Units of Antenna Altitude
         * Geoidal Separation
         * Units of Geoidal Separation
         * Age of differential GPS data
         * Differential reference station ID
         * Checksum
         */

        db().then(function (SQL) {
            gpsDatabase = fs.existsSync(gpsDatabasePath)
                ? new SQL.Database(fs.readFileSync(gpsDatabasePath))
                : new SQL.Database()
            gpsDatabase.run(
                'CREATE TABLE IF NOT EXISTS gps (timestamp float, latitude float, latitudeOrientation string, longitude float, longitudeOrientation string, quality int, satellites int, horizontalDilution float, altitude float, altitudeUnits string, geoidalSeparation float, geoidalSeparationUnits string, diffDataAge string, diffRefStationID int, checksum int);'
            )
        })
    },
    saveInternal: function () {
        fs.writeFileSync(
            gpsDatabasePath,
            new Buffer(gpsDatabase.export())
        )
    },
    insertGPS: function (
        timestamp,
        latitude,
        latitudeOrientation,
        longitude,
        longitudeOrientation,
        quality,
        satellites,
        horizontalDilution,
        altitude,
        altitudeUnits,
        geoidalSeparation,
        geoidalSeparationUnits,
        diffDataAge,
        diffRefStationID,
        checksum
    ) {
        gpsDatabase.run(
            `INSERT INTO gps VALUES(${timestamp}, ${latitude}, '${latitudeOrientation}', ${longitude}, '${longitudeOrientation}', ${quality}, ${satellites}, ${horizontalDilution}, ${altitude}, '${altitudeUnits}', ${geoidalSeparation}, '${geoidalSeparationUnits}', ${diffDataAge}, ${diffRefStationID}, ${checksum});`
        )
        this.saveInternal()
    },
    deleteGPS: function () {
        gpsDatabase.run('DELETE FROM gps')
        this.saveInternal()
    }
}