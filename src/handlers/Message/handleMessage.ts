import { WebSocket, RawData } from "ws";
import { ClientMessage } from "../../types/ClientMessage";
import { handleRegistration } from "../Player/handleRegistration";
import { handleCreateRoom } from "../Room/handleCreateRoom";
import { handleAddUserToRoom } from "../Room/handleAddUserToRoom";
import { handleAddShips } from "../Ships/handleAddShips";
import { handleAttack } from "../game/handleAttack";
import { handleRandomAttack } from "../game/handleRandomAttack";

// Main handler messages by Client
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

  let parsedData: unknown = msg.data;
  if (typeof msg.data === "string") {
    try {
      parsedData = JSON.parse(msg.data);
    } catch {
      parsedData = msg.data;
    }
  }

  console.log(
    "Received message:",
    JSON.stringify(
      {
        type: msg.type,
        data: parsedData,
        id: msg.id,
      },
      null,
      2
    )
  );

  try {
    switch (msg.type) {
      case "reg":
        handleRegistration(ws, msg);
        console.log("Processed registration command.");
        break;

      case "create_room":
        handleCreateRoom(ws);
        console.log("Processed create room command.");
        break;

      case "add_user_to_room": {
        try {
          const data = JSON.parse(msg.data);
          if (!data.indexRoom) {
            console.log("add_user_to_room command missing indexRoom.");
            return;
          }
          handleAddUserToRoom(ws, data.indexRoom);
          console.log(`Processed add user to room command. Player added to room ${data.indexRoom}.`);
        } catch (err) {
          console.log("Failed to parse add_user_to_room data:", err);
        }
        break;
      }

      case "add_ships":
        handleAddShips(ws, msg.data);
        console.log("Processed add ships command.");
        break;

      case "attack":
        handleAttack(ws, msg.data);
        console.log("Processed attack command.");
        break;

      case "randomAttack":
        handleRandomAttack(ws, msg.data);
        console.log("Processed random attack command.");
        break;

      default:
        console.log("Received unknown message type:", msg.type);
    }
  } catch (err) {
    console.log("Unexpected error:", err);
  }
};
