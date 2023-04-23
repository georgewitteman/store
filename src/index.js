import dns from "node:dns";
import http from "node:http";
import util from "node:util";

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log("Protocol: %s", req.protocol);
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
  console.log(`Listening on port ${server.address().port}`);
});

console.log(
  Object.fromEntries(server.eventNames().map((e) => [e, server.listeners(e)]))
);
