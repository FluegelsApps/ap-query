import React, { useEffect, useState } from "react";
import PowerMonitoringDataCard from "./PowerMonitoringDataCard";
import PowerMonitoringConfigurationCard from "./PowerMonitoringConfigurationCard";
import { useWebsocket } from "../../hooks/useWebsocket";

const PowerMonitoring = () => {

    const [measurements, setMeasurements] = useState([]);
    const [accessPointFilter, setAccessPointFilter] = useState(undefined);
    const [accessPoints, setAccessPoints] = useState([]);
    const [timespanFilter, setTimespanFilter] = useState(-1);
    const [displayType, setDisplayType] = useState(false);

    useWebsocket({
        notify_measurements_updated: rawMeasurements => setMeasurements(JSON.parse(rawMeasurements))
    });

    useEffect(() => {
        let newAccessPoints = [];

        for (let i = 0; i < measurements.length; i++) {
            if (!newAccessPoints.includes(measurements[i].ap))
                newAccessPoints.push(measurements[i].ap);
        }

        setAccessPoints(newAccessPoints);
    }, [measurements]);

    return (
        <div>
            <h1 className="ui header">Power Monitoring</h1>
            <PowerMonitoringConfigurationCard
                accessPoints={{ ...accessPoints }}
                setAccessPointFilter={setAccessPointFilter}
                timespans={{
                    [10 * 60 * 1000]: "Last 10 minutes",
                    [60 * 60 * 1000]: "Last hour",
                    [12 * 60 * 60 * 1000]: "Last 12 hours",
                    [24 * 60 * 60 * 1000]: "Last day",
                    [7 * 24 * 60 * 60 * 1000]: "Last week",
                    [-1]: "Entire timespan"
                }}
                setTimespanFilter={setTimespanFilter}
                displayType={displayType}
                setDisplayType={setDisplayType}
            />
            <PowerMonitoringDataCard
                displayType={displayType}
                measurements={measurements}
                apFilter={accessPointFilter}
                timeFilter={timespanFilter}
                setAPFilter={setAccessPointFilter}
            />
        </div >
    );
};

export default PowerMonitoring;