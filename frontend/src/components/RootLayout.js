import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useWebsocket } from "../hooks/useWebsocket";
import ExceptionModal from "./modal/ExceptionModal";
import "./RootLayout.css";

const RootLayout = () => {

    const [exception, setException] = useState(null);

    useWebsocket({
        notify_exception: rawException => {
            console.log("exception caught");
            setException(JSON.parse(rawException));
        }
    });

    return (
        <div>
            <div className="ui secondary pointing menu">
                <p className="header-title item">Aruba AP Poll Client</p>
                <Link className="item" to="/">Dashboard</Link>
                <Link className="item" to="/power">Power Data</Link>
                <Link className="item" to="/location">Location Data</Link>
                <Link className="item" to="/configuration">Configuration</Link>
            </div>
            <div className="ui container">
                <Outlet />
            </div>

            {exception != null ? (
                <ExceptionModal
                    exception={exception}
                    onDismiss={() => setException(null)}
                />
            ) : null}
        </div>
    );
};

export default RootLayout;