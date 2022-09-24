import { useEffect } from "react";
import io from "socket.io-client";

export const useWebsocket = (callbacks = {}) => {
    var socket = io();

    useEffect(() => {
        if (Object.entries(callbacks).length > 0) {
            for (const [key, value] of Object.entries(callbacks)) {
                socket.on(key, value);
            }
        }

        return () => {
            if (Object.entries(callbacks).length > 0) {
                for (const [key, value] of Object.entries(callbacks)) {
                    socket.on(key, value);
                }
            }
            socket.close();
        };
    }, [])

    return (event, data) => socket.emit(event, data);
}