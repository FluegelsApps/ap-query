import React from "react";

export const createInput = (placeholder, value, onChange, validation) => {
    const errorMessage = validation(value);
    return (
        <div>
            <div className={`ui input fluid ${errorMessage != null ? "error" : ""}`}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
            <p className="error-message">{errorMessage}</p>
        </div>
    );
};

export const createSwitch = (label, value, onChange) => {
    return (
        <div className="toggle-parent">
            {label}
            <div className="ui toggle checkbox">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={onChange}
                />
                <label></label>
            </div>
        </div>
    );
};

export const validationNotNull = value => value != null && value.length > 0 ? null : "Field cannot remain empty";
export const validationNumber = value => value != null && value.length === 0 ? "Field cannot remain empty" : isNaN(value) ? "Must be a number" : null;