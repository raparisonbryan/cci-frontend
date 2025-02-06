import { Server as WebSocketServer } from 'ws';
    import { NextApiRequest, NextApiResponse } from 'next';
    import { Socket } from 'net';

    const wss = new WebSocketServer({ noServer: true });

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

    export default function handler(req: NextApiRequest, res: NextApiResponse & { socket: Socket & { server: any } }) {
        if (!res.socket.server.ws) {
            res.socket.server.ws = wss;
        }

        if (req.headers.upgrade !== 'websocket') {
            res.status(400).json({ error: 'Expected WebSocket connection' });
            return;
        }

        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
            wss.emit('connection', ws, req);
        });
    }