import WebSocket from "ws";
import { ServerMessage } from "../types/ServerMessage";

// Sends message to Client
export const sendMessage = (ws: WebSocket, type: string, data: object) => {
  const msg: ServerMessage = { type, data: JSON.stringify(data), id: 0 };
  ws.send(JSON.stringify(msg));
};
