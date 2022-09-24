import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../modal/Modal";
import { createInput, createSwitch, validationNotNull, validationNumber } from "../form/Form";
import "../form/Form.css";

const ModifyConfigurationModal = ({ client, onConfigurationUpdated, onDismiss }) => {

    const [host, setHost] = useState(client.host);
    const [user, setUser] = useState(client.user);
    const [password, setPassword] = useState("");
    const [queryInterval, setQueryInterval] = useState(client.queryInterval);
    const [powerMonitoring, setPowerMonitoring] = useState(client.powerMonitoring === 1);
    const [gpsMonitoring, setGPSMonitoring] = useState(client.gpsMonitoring === 1);

    const [formValid, setFormValid] = useState(false);

    const updateConfiguration = () => {
        if (formValid) {
            // Update the actual client configuration
            axios.put("/api/configuration", {
                oldhost: client.host,
                host,
                user,
                password,
                queryInterval,
                powerMonitoring,
                gpsMonitoring,
            }).then(res => onConfigurationUpdated(res.data));
            onDismiss();
        }
    }

    useEffect(() => {
        setFormValid(
            validationNotNull(host) == null
            && validationNotNull(user) == null
            && validationNotNull(password) == null
            && validationNumber(queryInterval) == null
        );
    }, [host, user, password, queryInterval]);

    return (
        <Modal
            header="Modify Configuration"
            actions={(
                <>
                    <button className={`ui button ${formValid ? "positive" : "gray"}`} onClick={updateConfiguration}>Update</button>
                    <button className="ui button negative" onClick={onDismiss}>Cancel</button>
                </>
            )}
            onDismiss={onDismiss}
        >
            <div className="ui form">
                {createInput("Host Address", host, e => setHost(e.target.value), validationNotNull)}
                {createInput("Username", user, e => setUser(e.target.value), validationNotNull)}
                {createInput("Password", password, e => setPassword(e.target.value), validationNotNull)}
                {createInput("Query Interval", queryInterval, e => setQueryInterval(e.target.value), validationNumber)}
                {createSwitch("Power Monitoring", powerMonitoring, e => setPowerMonitoring(e.target.checked))}
                {createSwitch("GPS Monitoring", gpsMonitoring, e => setGPSMonitoring(e.target.checked))}
            </div>
        </Modal>
    );
};

export default ModifyConfigurationModal;