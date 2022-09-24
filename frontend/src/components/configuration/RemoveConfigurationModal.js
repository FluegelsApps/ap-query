import axios from "axios";
import React from "react";
import Modal from "../modal/Modal";

const RemoveConfigurationModal = ({ client, onDismiss, onConfigurationRemoved }) => {

    const removeConfiguration = () => {
        axios.delete(`/api/configuration/${client.host}`).then(res => onConfigurationRemoved(res.data));
        onDismiss();
    };

    return (
        <Modal
            header="Remove Client Configuration"
            actions={(
                <>
                    <button className="ui button primary" onClick={onDismiss}>Cancel</button>
                    <button className="ui button negative" onClick={removeConfiguration}>Remove</button>
                </>
            )}
            onDismiss={onDismiss}>
            This will remove the this configuration permentantly. Are you sure?
        </Modal>
    );
};

export default RemoveConfigurationModal