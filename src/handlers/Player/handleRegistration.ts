import WebSocket from "ws";
import { ClientMessage } from "../../types/ClientMessage";
import { sendMessage } from "../../helpers/sendMessage";
import { players, playerWsMap } from "../../db/inMemoryDB";
import { generateUUID } from "../../helpers/generateUUID";
import { handleUpdateRoom } from "../room/handleUpdateRoom";

export const handleRegistration = (ws: WebSocket, msg: ClientMessage) => {
  const { name, password } = JSON.parse(msg.data);

  let error = false;
  let errorText = "";
  let index: string | null = null;

  const existingPlayer = Object.values(players).find((player) => player.name === name);

  if (existingPlayer) {
    // login
    if (existingPlayer.password !== password) {
      error = true;
      errorText = "Invalid password";
      index = existingPlayer.id;
    } else {
      index = existingPlayer.id;

      playerWsMap.set(existingPlayer.id, ws);

      handleUpdateRoom();
    }
  } else {
    // registration
    index = generateUUID();

    players[index] = {
      id: index,
      name,
      password,
      roomId: null,
    };

    playerWsMap.set(index, ws);

    handleUpdateRoom();
  }

  sendMessage(ws, "reg", {
    name,
    index,
    error,
    errorText,
  });
};
