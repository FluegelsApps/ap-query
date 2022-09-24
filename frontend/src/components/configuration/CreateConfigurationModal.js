import React, { useEffect, useState } from "react";
import Modal from "../modal/Modal";
import axios from "axios";
import { createInput, createSwitch, validationNotNull, validationNumber } from "../form/Form";
import "../form/Form.css";

const CreateConfigurationModal = ({ onConfigurationCreated, onDismiss }) => {

    const [host, setHost] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [queryInterval, setQueryInterval] = useState("");
    const [powerMonitoring, setPowerMonitoring] = useState(false);
    const [gpsMonitoring, setGPSMonitoring] = useState(false);

    const [formValid, setFormValid] = useState(false);

    const createConfiguration = () => {
        if (formValid) {
            // Create the actual client configuration
            axios.post("/api/configuration", {
                host,
                user,
                password,
                queryInterval,
                powerMonitoring,
                gpsMonitoring,
            }).then(res => onConfigurationCreated(res.data));
            onDismiss();
        }
    };

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
            header="Create New Configuration"
            actions={(
                <>
                    <button className={`ui button ${formValid ? "positive" : "gray"}`} onClick={createConfiguration}>Save</button>
                    <button className="ui button secondary" onClick={onDismiss}>Cancel</button>
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

export default CreateConfigurationModal;