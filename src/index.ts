import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import Koa from "koa";
import Router from "@koa/router";
import { koaBody } from "koa-body";

const prisma = new PrismaClient();

const app = new Koa();
const router = new Router();

// app.use(koaBody());

router.get("/", async (ctx) => {
  const products = await prisma.product.findMany();
  ctx.body = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hi there</title>
  </head>
  <body>
    <h1>This is an H1</h1>
    ${products
      .map(
        (product) => `
      <details>
        <summary>${product.name}</summary>
        <ul>
          <li>Id: ${product.id}</li>
          <li>Name: ${product.name}</li>
          <li>
            <form method="POST" action="/delete">
              <input type="hidden" id="id" name="id" value="${product.id}" />
              <button type="submit">Delete</button>
            </form>
          </li>
        </ul>
      </details>
      `
      )
      .join("")}
  </body>
</html>
`;
});

router.post("/delete", async (ctx) => {
  const idRaw = ctx.request.body["id"];
  if (typeof idRaw !== "string") {
    console.warn("Not string %s (%s)", idRaw, typeof idRaw);
    ctx.redirect("/");
    return;
  }
  const idNumber = parseInt(idRaw, 10);
  await prisma.product.delete({
    where: { id: idNumber },
  });
  console.log("Deleted %s", idNumber);
  ctx.redirect("/");
});

router.get("/create", async (ctx) => {
  const blah = await prisma.product.create({
    data: {
      name: `Test Product ${randomUUID()}`,
    },
  });
  ctx.body = blah;
});

app.use(router.routes());

app.listen(8000, "0.0.0.0", () => {
  console.log("Listening...");
});
