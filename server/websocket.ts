import { WebSocketServer } from 'ws';
import { createServer } from 'http';

export function setupWebSocketServer() {
    const server = createServer();
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');

        ws.on('message', (message) => {
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === ws.OPEN) {
                    client.send(message.toString());
                }
            });
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    const PORT = process.env.WS_PORT || 8080;
    server.listen(PORT, () => {
        console.log(`WebSocket server running on port ${PORT}`);
    });

    return server;
}