import { createServer } from "node:http";
import { page } from "./html.mjs";

// Create a local server to receive data from
const server = createServer();

// Listen to the request event
server.on('request', (req, res) => {
  console.log("%s %s", req.method, req.url)
  if (req.url === "/") {
    page().then(readableStream => {
      res.writeHead(200, { 'content-type': 'text/html' });
      readableStream.pipe(res);
    }).catch(e => {
      console.error(e);
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end(e.message);
    })
    return
  }

  if (req.url === "/styles.css") {
    res.writeHead(200, { 'content-type': 'text/css' });
    res.end(`
  body {
    background: #ffffff;
    color: #333333;
    font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 1rem;
    font-style: normal;
    font-weight: normal;
    /* -webkit-font-smoothing: antialiased; */
    line-height: 1.5;
    margin: 0;
    text-rendering: optimizeLegibility;
    max-width: 24rem;
    margin: 0.5rem auto;
  }
    `);
    return
  }

  res.writeHead(404);
  res.end();
});

server.listen(8000, () => {
  console.log("Listening...");
});
