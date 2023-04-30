// import * as dns from "node:dns";
import * as http from "node:http";
// import * as util from "node:util";
import { z } from "zod";

const STATUS_CODES = {
  200: "OK",
  404: "Not Found",
  500: "Not Found",
} as const;

// export type JsonObject = {[Key in string]: JsonValue} & {[Key in string]?: JsonValue | undefined};
// export type JsonArray = JsonValue[] | readonly JsonValue[];
// export type JsonPrimitive = string | number | boolean | null;
// export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

class Response<T> {
  private readonly serverResponse: http.ServerResponse<http.IncomingMessage>;

  constructor(serverResponse: http.ServerResponse) {
    this.serverResponse = serverResponse;
  }

  send(statusCode: keyof typeof STATUS_CODES, body: T) {
    this.serverResponse.writeHead(statusCode);
    this.serverResponse.end(body);
  }
}

function createRoute<S extends z.ZodType<unknown>>(
  schema: S,
  handler: (req: z.infer<S>, res: Response<unknown>) => Promise<void>
) {
  return new Route(schema, handler);
}

class Route<S extends z.ZodType<unknown>> {
  schema: S;
  handler: (req: z.infer<S>, res: Response<unknown>) => Promise<void>;

  constructor(
    schema: S,
    handler: (req: z.infer<S>, res: Response<unknown>) => Promise<void>
  ) {
    this.schema = schema;
    this.handler = handler;
  }
}

const route1 = createRoute(
  z.object({ path: z.literal("/"), query: z.object({ foo: z.string() }) }),
  async (req: { query: { foo: string } }, res: Response<string>) => {
    res.send(200, req.query.foo);
  }
);

const route2 = createRoute(
  z.object({ path: z.literal("/two") }),
  async (req: { path: "/two" }, res: Response<string>) => {
    res.send(200, req.path);
  }
);

function handleError(res: Response<unknown>) {
  return (e: unknown) => {
    res.send(500, e);
  };
}

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  console.log(url.href);
  const query = Object.fromEntries(url.searchParams.entries());
  const response = new Response<unknown>(res);
  const request = { path: url.pathname, query };

  const route1Parsed = route1.schema.safeParse(request);
  if (route1Parsed.success) {
    route1.handler(route1Parsed.data, response).catch(handleError(response));
    return;
  }
  const route2Parsed = route2.schema.safeParse(request);
  if (route2Parsed.success) {
    route2.handler(route2Parsed.data, response).catch(handleError(response));
    return;
  }
  response.send(500, "error");
}

const server = http.createServer(handleRequest);

server.listen(8000, () => {
  const address = server.address();
  const port =
    typeof address === "object" && address && "port" in address
      ? address.port
      : address;
  console.log(`Listening on port ${port}`);
});

console.log(
  Object.fromEntries(server.eventNames().map((e) => [e, server.listeners(e)]))
);
