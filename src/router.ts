import * as http from "node:http";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { z } from "zod";
import { Headers } from "./types.js";

export class Route<S extends z.ZodType<{ headers: Headers }>> {
  path: string;
  schema: S;
  handler: (
    request: Request<z.infer<S>["headers"]>,
    response: Response
  ) => Promise<void>;

  constructor(
    path: string,
    schema: S,
    handler: (
      request: Request<z.infer<S>["headers"]>,
      response: Response
    ) => Promise<void>
  ) {
    this.path = path;
    this.schema = schema;
    this.handler = handler;
  }
}

export class Router<R extends Route<z.ZodType<{ headers: Headers }>>> {
  private readonly routes: R[];

  constructor(routes: R[]) {
    this.routes = routes;
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const route = this.routes.find((r) => r.path === url.pathname);
    if (!route) {
      res.writeHead(404, {});
      res.end(`Not found: ${req.url}`);
      return;
    }

    const headers = req.headers;

    const parseResult = route.schema.safeParse({ headers });
    if (!parseResult.success) {
      res.writeHead(400, {});
      res.end(`Bad request: ${JSON.stringify(parseResult.error)}`);
      return;
    }

    const internalRequest = new Request(url.href, parseResult.data.headers);
    const internalResponse = new Response(res);

    route.handler(internalRequest, internalResponse).catch((e) => {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify(e));
    });
  }
}
