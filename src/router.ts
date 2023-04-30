import * as http from "node:http";
import { Request } from "./request.js";
import { Response } from "./response.js";

type RequestHandler = (request: Request, response: Response) => Promise<void>;

async function defaultHandler(request: Request, response: Response) {
  response.writeHead(404, {});
  response.end(`Not found: ${request.url}`);
}

export class Router {
  private routes: Record<string, RequestHandler>;

  constructor() {
    this.routes = {};
  }

  route(path: string, handler: RequestHandler) {
    this.routes[path] = handler;
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const handler = this.routes[url.pathname] || defaultHandler;

    handler(new Request(req), new Response(res)).catch((e) => {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify(e));
    });
  }
}
