import React from "react";

const ConfigurationClientListItem = ({ client, onEditClient, onDeleteClient, changeClientState }) => {
    return (
        <div className="item">
            <div className="header">
                {client.host} ({client.user})
            </div>
            <div className="content"><div>
                {client.powerMonitoring ? "Power" : ""}
                {client.powerMonitoring && client.gpsMonitoring ? ", " : ""}
                {client.gpsMonitoring ? "GPS" : ""}
            </div>
                <div className="right floated content">
                    {client.state === 2 // Connection is being established
                        ? (
                            <div style={{ marginRight: "15px", marginBottom: "5px" }} className="ui active inline loader"></div>
                        )
                        : (
                            <div style={{ marginRight: "25px" }} className="ui toggle checkbox">
                                <input type="checkbox" checked={client.state === 1} name="client_enabled" onChange={e => changeClientState(e.target.checked, client)} />
                                <label>State</label>
                            </div>
                        )
                    }
                    <button onClick={() => onEditClient(client)} className="ui icon button">
                        <i className="edit icon" />
                    </button>
                    <button onClick={() => onDeleteClient(client)} className="ui icon button negative">
                        <i className="delete icon" />
                    </button>
                </div>
            </div>
        </div >
    );
};

export default ConfigurationClientListItem;