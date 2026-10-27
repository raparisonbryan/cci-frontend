"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketContextType {
    ws: WebSocket | null;
    isConnected: boolean;
    connectionCount: number;
    sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    isConnected: false,
    connectionCount: 0,
    sendMessage: () => {},
});

interface WebSocketProviderProps {
    children: ReactNode;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://cci-api.com/socket';
const MAX_RECONNECT_DELAY = 30000;

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionCount, setConnectionCount] = useState(0);

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let attempts = 0;
        let disposed = false;

        const connect = () => {
            socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log('WebSocket connected');
                attempts = 0;
                setIsConnected(true);
                setConnectionCount(count => count + 1);
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                if (disposed) return;

                const delay = Math.min(1000 * 2 ** attempts, MAX_RECONNECT_DELAY);
                attempts++;
                reconnectTimer = setTimeout(connect, delay);
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            setWs(socket);
        };

        connect();

        return () => {
            console.log('Cleaning up WebSocket connection');
            disposed = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            socket?.close();
        };
    }, []);

    const sendMessage = (message: any) => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    };

    return (
        <WebSocketContext.Provider value={{ ws, isConnected, connectionCount, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);