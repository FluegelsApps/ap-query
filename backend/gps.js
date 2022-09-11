const gpsDatabasePath = "gps.sqlite"
const fs = require("fs")
const db = require("sql.js")

let gpsDatabase

module.exports = {
    initialize: function () {
        /**
         * Data structure:
         * Timestamp
         * Access Point DNS or Address
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
         * Original string that was received
         */

        db().then(function (SQL) {
            gpsDatabase = fs.existsSync(gpsDatabasePath)
                ? new SQL.Database(fs.readFileSync(gpsDatabasePath))
                : new SQL.Database()
            gpsDatabase.run(
                'CREATE TABLE IF NOT EXISTS gps (timestamp float, accessPoint string, latitude string, latitudeOrientation string, longitude string, longitudeOrientation string, quality int, satellites int, horizontalDilution float, altitude float, altitudeUnits string, geoidalSeparation float, geoidalSeparationUnits string, diffDataAge string, diffRefStationID int, checksum int, original string);'
            )
        })
    },
    saveInternal: function () {
        fs.writeFileSync(
            gpsDatabasePath,
            new Buffer(gpsDatabase.export())
        )
    },
    getGPSData: function () {
        const fetchStatement = gpsDatabase.prepare(
            'SELECT * FROM gps'
        )
        fetchStatement.getAsObject()
        fetchStatement.bind()

        let gpsData = '[\n'
        while (fetchStatement.step())
            gpsData =
                gpsData + JSON.stringify(fetchStatement.getAsObject()) + ','
        gpsData = gpsData.substring(0, gpsData.length - 1) + '\n]'
        return gpsData
    },
    insertGPS: function (
        timestamp,
        accessPoint,
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
        checksum,
        original
    ) {
        console.log(accessPoint);
        gpsDatabase.run(
            `INSERT INTO gps VALUES(${timestamp}, '${accessPoint}', '${latitude}', '${latitudeOrientation}', '${longitude}', '${longitudeOrientation}', ${quality}, ${satellites}, ${horizontalDilution}, ${altitude}, '${altitudeUnits}', ${geoidalSeparation}, '${geoidalSeparationUnits}', ${diffDataAge}, ${diffRefStationID}, ${checksum}, '${original}');`
        )
        this.saveInternal()
    },
    deleteGPS: function () {
        gpsDatabase.run('DELETE FROM gps')
        this.saveInternal()
    },
    downloadGPS: function (accessPoints) {
        let condition = ''
        for (let i = 0; i < accessPoints.length; i++)
            condition = condition + `accessPoint = '${accessPoints[i]}' OR `
        condition = condition.substring(0, condition.length - 4)

        const downloadStatement = gpsDatabase.prepare(
            `SELECT * FROM gps WHERE ${condition}`
        )
        downloadStatement.getAsObject()
        downloadStatement.bind()

        let gpsData = '';
        while (downloadStatement.step()) {
            let instance = downloadStatement.getAsObject()
            gpsData = `${gpsData}${instance.timestamp}, '${instance.accessPoint}', '${instance.latitude}', '${instance.latitudeOrientation}', '${instance.longitude}', '${instance.longitudeOrientation}', ${instance.quality}, ${instance.satellites}, ${instance.horizontalDilution}, ${instance.altitude}, '${instance.altitudeUnits}', ${instance.geoidalSeparation}, '${instance.geoidalSeparationUnits}', '${instance.diffDataAge}', ${instance.diffRefStationID}, ${instance.checksum}\n`
        }

        return (
            '"Timestamp", "Access Point (Host)", "Latitude", "Latitude Orientation", "Longitude", "Longitude Orientation", "Quality Index", "Number of Satellites", "Horizontal Dilution", "Antenna Altitude", "Antenna Altitude Units", "Geoidal Separation", "Geoidal Separation Units", "Differential Data Age", "Differential Reference Station ID", "Checksum"\n' +
            gpsData
        )
    },
    downloadGPSRaw: function (accessPoints) {
        let condition = ''
        for (let i = 0; i < accessPoints.length; i++)
            condition = condition + `accessPoint = '${accessPoints[i]}' OR `
        condition = condition.substring(0, condition.length - 4)

        const downloadStatement = gpsDatabase.prepare(
            `SELECT * FROM gps WHERE ${condition}`
        )
        downloadStatement.getAsObject()
        downloadStatement.bind()

        let gpsData = ''
        while (downloadStatement.step())
            gpsData = `${gpsData}${downloadStatement.getAsObject().original}\n`

        return gpsData
    },
}