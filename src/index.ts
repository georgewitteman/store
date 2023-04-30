import { z } from "zod";
import { App, Route } from "./app.js";

const app = new App();

app.route(
  new Route(
    { path: "/", method: "GET", query: z.object({ foo: z.string() }) },
    async (req, res) => {
      res.send(200, req.query.foo);
    }
  )
);

app.listen();
