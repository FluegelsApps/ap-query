import React from "react";
import ConfigurationClientListItem from "./ConfigurationClientListItem";

const ConfigurationClientList = ({ clients, onEditClient, onDeleteClient, changeClientState }) => {

    const renderedClients = clients.map(client => {
        return (
            <ConfigurationClientListItem
                key={client.host}
                client={client}
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
                changeClientState={changeClientState}
            />
        );
    });

    return (
        <div className="ui relaxed divided list">
            {renderedClients}
        </div>
    );
};

export default ConfigurationClientList;