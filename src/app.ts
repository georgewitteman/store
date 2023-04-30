import * as http from "node:http";
import { z } from "zod";

export class Response {
  private response: http.ServerResponse;

  constructor(response: http.ServerResponse) {
    this.response = response;
  }

  writeHead(statusCode: number, headers: Record<string, string>) {
    this.response.writeHead(statusCode, headers);
  }

  end(body: string) {
    this.response.end(body);
  }

  send(statusCode: number, body: string) {
    this.response.writeHead(statusCode);
    this.response.end(body);
  }
}

export class Request<Q> {
  query: Q;

  constructor(query: Q) {
    this.query = query;
  }
}

type RouteOptions<Q> = {
  path: string;
  method: "GET" | "POST";
  query?: z.ZodType<Q>;
};

export class Route<Q> {
  options: RouteOptions<Q>;
  handler: (req: Request<Q>, res: Response) => Promise<void>;

  constructor(
    options: RouteOptions<Q>,
    handler: (req: Request<Q>, res: Response) => Promise<void>
  ) {
    this.options = options;
    this.handler = handler;
  }
}

export class App {
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
  routes: Route<unknown>[];

  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.routes = [];
  }

  route<Q>(route: Route<Q>) {
    // TODO: Can we get rid of this any?
    this.routes.push(route as any);
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const query = Object.fromEntries(url.searchParams.entries());
    const route = this.routes.find(
      (route) =>
        route.options.method === req.method &&
        route.options.path === url.pathname &&
        (route.options.query?.safeParse(query).success ?? true)
    );
    if (!route) {
      res.writeHead(404);
      res.end("no route found");
      return;
    }
    route.handler(new Request(query), new Response(res));
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
