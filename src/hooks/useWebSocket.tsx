"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketContextType {
    ws: WebSocket | null;
    isConnected: boolean;
    sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    isConnected: false,
    sendMessage: () => {},
});

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!ws) {
            const socket = new WebSocket('wss://cci-api.com/socket');

            socket.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            setWs(socket);
        }

        return () => {
            if (ws) {
                console.log('Cleaning up WebSocket connection');
                ws.close();
            }
        };
    }, [ws]);

    const sendMessage = (message: any) => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    };

    return (
        <WebSocketContext.Provider value={{ ws, isConnected, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);