import { z } from "zod";
import { App } from "./app.js";
import PG from "pg";

async function execute<S extends z.ZodType<unknown>>(
  client: PG.Client,
  schema: S,
  query: string
): Promise<z.infer<S>> {
  const queryResult = await client.query<Record<string, unknown>>(query);
  console.log(queryResult);
  return schema.parse(queryResult.rows);
}

const app = new App(async (_req, res) => {
  const client = new PG.Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "postgres",
    port: 5432,
  });
  await client.connect();
  const [row] = await execute(
    client,
    z.tuple([z.object({ now: z.date() })]),
    "SELECT NOW()"
  );
  await client.end();
  res.writeHead(200, {});
  res.end(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hi there</title>
  </head>
  <body>
    <h1>This is an H1 ${row.now}</h1>
    <details>
      <summary>iRobot Roomba 675 <strong>Robot Vacuum</strong></summary>
      <ul>
        <li>Model #: GTD635HSM0SS (on interior), GDT635HSMSS (online)
        <li><a href="https://www.geappliances.com/appliance/GE-Top-Control-with-Stainless-Steel-Interior-Door-Dishwasher-with-Sanitize-Cycle-Dry-Boost-GDT635HSMSS">GE Product Page</a></li>
      </ul>
    </details>
  </body>
</html>
`);
});

app.listen();
