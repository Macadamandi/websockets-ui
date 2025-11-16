import fs from "node:fs";
import path from "node:path";
import http, { IncomingMessage, ServerResponse } from "node:http";

export const httpServer = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const __dirname = path.resolve(path.dirname(""));
  const filePath = __dirname + (req.url === "/" ? "/front/index.html" : "/front" + req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});
