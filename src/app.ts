import * as http from "node:http";
import { Method } from "./types.js";
import { Route, RouteOptions } from "./route.js";
import { Request } from "./request.js";
import { Response } from "./response.js";

async function rawBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("error", (err) => reject(err));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

// https://github.com/farrow-js/farrow/blob/master/examples/example/src/api/todos.ts
export class App {
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
  routes: Route<Method, unknown, unknown>[];

  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.routes = [];
  }

  route<M extends Method, Q, J>(
    options: RouteOptions<M, Q, J>,
    handler: (req: Request<M, Q, J>, res: Response) => Promise<void>
  ) {
    const route = new Route(options, handler);
    // TODO: Can we get rid of this any?
    this.routes.push(route as any);
  }

  async handleRequestInner(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    const method = req.method;
    const host = req.headers.host;
    const rawUrl = req.url;
    if (!rawUrl || !host || !method) {
      res.writeHead(400);
      res.end("missing url, host, or method");
      return;
    }
    const url = new URL(rawUrl, `http://${host}`);
    const query = Object.fromEntries(url.searchParams.entries());
    const pathParts = url.pathname.slice(1).split("/");
    const body = await rawBody(req);
    const json = JSON.parse(body);
    console.log(pathParts, method, query, json);
    const route = this.routes.find((route) =>
      route.match(pathParts, method, query, json)
    );
    if (!route) {
      res.writeHead(404);
      res.end("no route found");
      return;
    }
    const parsedQuery = route.options.query?.parse(query);
    await route.handler(
      new Request(url, route.options.method, pathParts, parsedQuery, json),
      new Response(res)
    );
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    this.handleRequestInner(req, res).catch((e) => {
      console.error(e);
      res.writeHead(500);
      res.end(e.message);
    });
  }

  listen() {
    return new Promise<void>((resolve) => {
      this.server.listen(8000, () => {
        const address = this.server.address();
        const port =
          typeof address === "object" && address && "port" in address
            ? address.port
            : address;
        console.log(`Listening on port ${port}`);
        resolve();
      });
    });
  }
}
