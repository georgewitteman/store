import { z } from "zod";
import { Method } from "./types.js";
import { Request } from "./request.js";
import { Response } from "./response.js";

export type RouteOptions<M extends Method, Q, J> = {
  path: z.ZodTuple;
  method: M;
  query?: z.ZodType<Q>;
  json?: z.ZodType<J>;
};

export class Route<M extends Method, Q, J> {
  options: RouteOptions<M, Q, J>;
  handler: (req: Request<M, Q, J>, res: Response) => Promise<void>;

  constructor(
    options: RouteOptions<M, Q, J>,
    handler: (req: Request<M, Q, J>, res: Response) => Promise<void>
  ) {
    this.options = options;
    this.handler = handler;
  }

  match(path: string[], method: string, query: unknown, json: unknown) {
    return (
      this.options.method === method &&
      this.options.path.safeParse(path).success &&
      (this.options.query?.safeParse(query).success ?? true) &&
      (this.options.json?.safeParse(json).success ?? true)
    );
  }
}
