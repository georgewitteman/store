import * as http from "node:http";
import { z } from "zod";

type Method = "GET" | "POST" | "OPTIONS";

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

export class Request<M extends Method, Q> {
  query: Q;
  url: URL;
  method: M;

  constructor(url: URL, method: M, query: Q) {
    this.url = url;
    this.method = method;
    this.query = query;
  }
}

type RouteOptions<M extends Method, Q> = {
  path: string;
  method: M;
  query?: z.ZodType<Q>;
};

export class Route<M extends Method, Q> {
  options: RouteOptions<M, Q>;
  handler: (req: Request<M, Q>, res: Response) => Promise<void>;

  constructor(
    options: RouteOptions<M, Q>,
    handler: (req: Request<M, Q>, res: Response) => Promise<void>
  ) {
    this.options = options;
    this.handler = handler;
  }

  match(path: string, method: string, query: unknown) {
    return (
      this.options.method === method &&
      this.options.path === path &&
      (this.options.query?.safeParse(query).success ?? true)
    );
  }
}

// https://github.com/farrow-js/farrow/blob/master/examples/example/src/api/todos.ts
export class App {
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
  routes: Route<Method, unknown>[];

  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.routes = [];
  }

  route<M extends Method, Q>(
    options: RouteOptions<M, Q>,
    handler: (req: Request<M, Q>, res: Response) => Promise<void>
  ) {
    const route = new Route(options, handler);
    // TODO: Can we get rid of this any?
    this.routes.push(route as any);
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
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
    const route = this.routes.find((route) =>
      route.match(url.pathname, method, query)
    );
    if (!route) {
      res.writeHead(404);
      res.end("no route found");
      return;
    }
    const parsedQuery = route.options.query?.parse(query);
    route
      .handler(
        new Request(url, route.options.method, parsedQuery),
        new Response(res)
      )
      .catch((e) => {
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
