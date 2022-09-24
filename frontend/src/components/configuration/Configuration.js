import axios from "axios";
import React, { useEffect, useState } from "react";
import { useWebsocket } from "../../hooks/useWebsocket";
import ConfigurationClientList from "./ConfigurationClientList";
import CreateConfigurationModal from "./CreateConfigurationModal";
import ModifyConfigurationModal from "./ModifyConfigurationModal";
import RemoveConfigurationModal from "./RemoveConfigurationModal";

const Configuration = () => {

    const [clients, setClients] = useState([]);
    const [editClient, setEditClient] = useState(null);
    const [deleteClient, setDeleteClient] = useState(null);
    const [createClient, setCreateClient] = useState(false);

    const updateClients = newClients => setClients(newClients);

    const emit = useWebsocket({
        notify_configdb_updated: newClients => {
            setClients(JSON.parse(newClients));
            console.log("Update clients", newClients);
        }
    });

    useEffect(() => {
        axios.get("/api/configuration").then(res => setClients(res.data));
    }, []);

    return (
        <div>
            <h1 className="ui header">Client Configuration</h1>
            <ConfigurationClientList
                clients={clients}
                onEditClient={client => setEditClient(client)}
                onDeleteClient={client => setDeleteClient(client)}
                changeClientState={(state, client) => emit(state ? "start_connection" : "stop_connection", client)}
            />
            <div className="configuration-new-container">
                <button onClick={() => setCreateClient(true)} className="ui fluid primary labeled icon button">
                    <i className="add icon" />
                    New Configuration
                </button>
            </div>

            {createClient ? (
                <CreateConfigurationModal
                    onDismiss={() => setCreateClient(false)}
                    onConfigurationCreated={updateClients}
                />
            ) : null}
            {editClient != null ? (
                <ModifyConfigurationModal
                    client={editClient}
                    onDismiss={() => setEditClient(null)}
                    onConfigurationUpdated={updateClients}
                />
            ) : null}
            {deleteClient != null ? (
                <RemoveConfigurationModal
                    client={deleteClient}
                    onDismiss={() => setDeleteClient(null)}
                    onConfigurationRemoved={updateClients}
                />
            ) : null}
        </div>
    );
};

export default Configuration;