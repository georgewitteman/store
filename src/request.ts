import * as http from "node:http";

export class Request {
  private request: http.IncomingMessage;

  constructor(request: http.IncomingMessage) {
    this.request = request;
  }

  get headers() {
    return this.request.headers;
  }

  get url() {
    return this.request.url;
  }
}
