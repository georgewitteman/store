import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import Koa from "koa";
import Router from "@koa/router";

const prisma = new PrismaClient();

const app = new Koa();
const router = new Router();

router.get("/", async (ctx) => {
  // @ts-expect-error
  asdf.asdf;
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
        </ul>
      </details>
      `
      )
      .join("")}
    <details>
      <summary>iRobot Roomba 675 <strong>Robot Vacuum</strong></summary>
      <ul>
        <li>Model #: GTD635HSM0SS (on interior), GDT635HSMSS (online)
        <li><a href="https://www.geappliances.com/appliance/GE-Top-Control-with-Stainless-Steel-Interior-Door-Dishwasher-with-Sanitize-Cycle-Dry-Boost-GDT635HSMSS">GE Product Page</a></li>
      </ul>
    </details>
  </body>
</html>
`;
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

app.listen(8000);
