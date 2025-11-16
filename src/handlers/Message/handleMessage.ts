import { WebSocket, RawData } from "ws";
import { ClientMessage } from "../../types/ClientMessage";
import { handleRegistration } from "../Player/handleRegistration";
import { handleCreateRoom } from "../Room/handleCreateRoom";
import { handleAddUserToRoom } from "../Room/handleAddUserToRoom";

export const handleMessage = (ws: WebSocket, raw: RawData) => {
  let rawStr: string;

  if (typeof raw === "string") {
    rawStr = raw;
  } else if (raw instanceof Buffer) {
    rawStr = raw.toString("utf-8");
  } else {
    return;
  }

  let msg: ClientMessage;
  try {
    msg = JSON.parse(rawStr);
  } catch {
    console.log("Invalid JSON received:", rawStr);
    return;
  }

  switch (msg.type) {
    case "reg":
      handleRegistration(ws, msg);
      break;
    case "create_room":
      handleCreateRoom(ws);
      break;
    case "add_user_to_room": {
      try {
        const data = JSON.parse(msg.data); 
        if (!data.indexRoom) {
          console.log("add_user_to_room missing indexRoom");
          return;
        }
        handleAddUserToRoom(ws, data.indexRoom);
      } catch (err) {
        console.log("Invalid add_user_to_room data:", err);
      }
      break;
    }
    default:
      console.log("Unknown message type:", msg.type);
  }
};
