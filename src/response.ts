import * as http from "node:http";
import { StatusCode } from "./types.js";

export class Response {
  private response: http.ServerResponse;

  constructor(response: http.ServerResponse) {
    this.response = response;
  }

  write(data: string) {
    this.response.write(data);
  }

  writeHead(statusCode: StatusCode, headers: Record<string, string>) {
    this.response.writeHead(statusCode, headers);
  }

  end(body: string) {
    this.response.end(body);
  }

  send(statusCode: StatusCode, body: string) {
    this.response.writeHead(statusCode);
    this.response.end(body);
  }
}
