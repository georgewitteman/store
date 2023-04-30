import * as http from "node:http";

export class Response {
  private response: http.ServerResponse;

  constructor(response: http.ServerResponse) {
    this.response = response;
  }

  writeHead(statusCode: number, headers: Record<string, string>) {
    this.response.writeHead(statusCode, headers);
  }

  end(body: string) {
    this.response.end(body);
  }
}
