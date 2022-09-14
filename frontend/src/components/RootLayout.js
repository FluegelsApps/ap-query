import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./RootLayout.css";

const RootLayout = () => {
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
        </div>
    );
};

export default RootLayout();