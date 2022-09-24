import React from "react";
import Modal from "./Modal";

const ExceptionModal = ({ exception, onDismiss }) => {
    console.log(exception);
    return (
        <Modal
            header="Connection failed"
            actions={(
                <>
                    <button className="ui button primary" onClick={onDismiss}>Dismiss</button>
                </>
            )}
            onDismiss={onDismiss}
        >
            Origin: {exception.origin.toString()}<br />
            {JSON.stringify(exception.instance)}
        </Modal>
    );
};

export default ExceptionModal;