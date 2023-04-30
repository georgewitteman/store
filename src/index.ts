import { z } from "zod";
import { App } from "./app.js";

const app = new App();

app.route(
  { path: "/", method: "GET", query: z.object({ foo: z.string() }) },
  async (req, res) => {
    res.send(200, req.query.foo);
  }
);

app.route({ path: "/foo", method: "GET" }, async (req, res) => {
  res.send(200, `${req.method}: ${req.url.href}`);
});

app.route({ path: "/fail", method: "GET" }, async (req, res) => {
  // @ts-expect-error
  asdf.asdf;
  res.send(200, `${req.method}: ${req.url.href}`);
});

app.listen();
