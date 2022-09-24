import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ header, children, actions, onDismiss }) => {
    return ReactDOM.createPortal(
        (
            <div onClick={onDismiss} className="ui dimmer modals visible active">
                <div onClick={e => e.stopPropagation()} className="ui standard modal visible active">
                    <div className="header">{header}</div>
                    <div className="content">
                        {children}
                    </div>
                    <div className="actions">
                        {actions}
                    </div>
                </div>
            </div>
        ),
        document.querySelector('#modal')
    );
};

export default Modal;