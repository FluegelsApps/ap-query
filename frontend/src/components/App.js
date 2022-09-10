import React from 'react';
import ConfigurationCard from './configuration/ConfigurationCard';
import './App.css';

export default () => {
    return (
        <div className="root-container ui container">
            <h2>Aruba Access Point SSH Poll Client</h2>
            <div className="ui cards">
                <ConfigurationCard />
            </div>
        </div>
    );
};