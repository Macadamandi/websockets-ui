import { httpServer } from "./src/http_server/httpServer";
import { createWsServer } from "./src/ws/wsServer";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

createWsServer(WS_PORT);
