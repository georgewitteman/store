import { Method } from "./types.js";

export class Request<M extends Method, Q, J> {
  query: Q;
  url: URL;
  pathParts: string[];
  method: M;
  json: J;

  constructor(url: URL, method: M, pathParts: string[], query: Q, json: J) {
    this.url = url;
    this.method = method;
    this.pathParts = pathParts;
    this.query = query;
    this.json = json;
  }
}
