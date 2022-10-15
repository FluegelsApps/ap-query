import React from "react";
import PowerMonitoringChart from "./PowerMonitoringChart";
import PowerMonitoringTable from "./PowerMonitoringTable";
import "./PowerMonitoring.css";

const PowerMonitoringDataCard = ({ measurements, displayType, setAPFilter, apFilter, timeFilter }) => {
  return (
    <div className="ui card fluid">
      <div className="card-container">
        <h3 className="ui header">Power Monitoring Data</h3>
        {displayType ? (
          <PowerMonitoringTable
            measurements={measurements}
            apFilter={apFilter}
            timeFilter={timeFilter}
          />
        ) : (
          <PowerMonitoringChart
            measurements={measurements}
            setAPFilter={setAPFilter}
            apFilter={apFilter}
            timeFilter={timeFilter}
          />
        )}
      </div>
    </div>
  );
};

export default PowerMonitoringDataCard;