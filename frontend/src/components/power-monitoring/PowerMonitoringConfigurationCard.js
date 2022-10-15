import React from "react";
import "./PowerMonitoring.css";

const PowerMonitoringConfigurationCard = ({
    accessPoints, setAccessPointFilter,
    timespans, setTimespanFilter,
    displayType, setDisplayType,
}) => {

    const createDropdown = (name, placeholder, items, setter) => {
        return (
            <div className="dropdown-container ui fluid search selection dropdown">
                <input type="hidden" name={name} onChange={e => setter(e.target.value)} />
                <i className="dropdown icon"></i>
                <div className="default text">{placeholder}</div>
                <div className="menu">
                    {Object.entries(items).map(entry => {
                        return (
                            <div className="item" data-value={entry[0]}>
                                {entry[1]}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="ui card fluid">
            <div className="card-container">
                <h3 className="ui header">Configuration &amp; Settings</h3>
                {createDropdown("filter_access_point", "Select an Access Point", accessPoints, setAccessPointFilter)}
                {createDropdown("filter_timespan", "Select a timespan", timespans, setTimespanFilter)}
                <div className="switch-container">
                    {displayType ? ("Chart") : (<b>Chart</b>)}
                    <div className="ui toggle checkbox">
                        <input type="checkbox" checked={displayType} onChange={e => setDisplayType(e.target.checked)} />
                        <label></label>
                    </div>
                    {displayType ? (<b>Table</b>) : ("Table")}
                </div>
                <div className="ui divider" />
                <button className="button-container ui fluid primary labeled icon button">
                    <i className="download icon" />
                    Download Power Monitoring Data (*.csv)
                </button>
                <button className="button-container ui fluid primary labeled icon button">
                    <i className="upload icon" />
                    Upload Power Monitoring Data (*.csv)
                </button>
                <button className="button-container ui fluid primary labeled icon button">
                    <i className="trash icon" />
                    Delete Power Monitoring Data
                </button>
            </div>
        </div>
    );
}

export default PowerMonitoringConfigurationCard;