import { z } from "zod";
import { App } from "./app.js";

const app = new App();

app.route(
  {
    path: z.tuple([z.literal("")]),
    method: "GET",
    query: z.object({ foo: z.string() }),
  },
  async (req, res) => {
    res.send(200, req.query.foo);
  }
);

app.route(
  { path: z.tuple([z.literal("foo")]), method: "GET" },
  async (req, res) => {
    res.send(200, `${req.method}: ${req.url.href}`);
  }
);

app.route(
  {
    path: z.tuple([z.literal("foo"), z.string(), z.literal("bar")]),
    method: "GET",
  },
  async (req, res) => {
    res.send(200, `${req.method}: ${req.url.href} - ${req.pathParts}`);
  }
);

app.route(
  { path: z.tuple([z.literal("fail")]), method: "GET" },
  async (req, res) => {
    // @ts-expect-error
    asdf.asdf;
    res.send(200, `${req.method}: ${req.url.href}`);
  }
);

app.listen();
