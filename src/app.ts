import * as http from "node:http";
import { Response } from "./response.js";
import { IncomingRequest } from "./incoming-request.js";

type RequestHandler = (req: IncomingRequest, res: Response) => Promise<void>;

export class App {
  server: ReturnType<typeof http.createServer>;
  handler: RequestHandler;

  constructor(handler: RequestHandler) {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.handler = handler;
  }

  async handleRequestInner(
    incomingRequest: IncomingRequest,
    response: Response
  ) {
    await this.handler(incomingRequest, response);
  }

  handleRequest(
    incomingMessage: http.IncomingMessage,
    serverResponse: http.ServerResponse
  ) {
    console.info("Request: %s", incomingMessage.url);
    const incomingRequest = new IncomingRequest();
    const response = new Response(serverResponse);
    this.handleRequestInner(incomingRequest, response)
      .then(() => {
        console.info(
          "Response: %s %s",
          serverResponse.statusCode,
          serverResponse.statusMessage
        );
      })
      .catch((e) => {
        console.error(e);
        serverResponse.writeHead(500);
        serverResponse.end();
      });
  }

  listen() {
    this.server.listen(8000, () => {
      const address = this.server.address();
      const port =
        typeof address === "object" && address && "port" in address
          ? address.port
          : address;
      console.log(`Listening on port ${port}`);
    });
  }
}
