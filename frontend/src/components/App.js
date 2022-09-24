import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RootLayout from './RootLayout';
import './App.css';
import Dashboard from './dashboard/Dashboard';
import NotFoundPage from './NotFoundPage';
import PowerMonitoring from './power-monitoring/PowerMonitoring';
import LocationMonitoring from './location-monitoring/LocationMonitoring';
import Configuration from './configuration/Configuration';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/power" element={<PowerMonitoring />} />
                    <Route path="/location" element={<LocationMonitoring />} />
                    <Route path="/configuration" element={<Configuration />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;