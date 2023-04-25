import * as dns from "node:dns";
import * as http from "node:http";
import * as util from "node:util";

async function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  console.log("URL: %s", url.toString());
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: res.statusCode,
      statusCode: http.STATUS_CODES[res.statusCode],
      data: "Hello World!",
      "google.com": await util.promisify(dns.lookup)("google.com"),
    })
  );
}

const server = http.createServer(handler);

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
