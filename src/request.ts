// import { Headers } from "./types.js";

export class Request<H> {
  readonly headers: H;
  readonly url: string;

  constructor(url: string, headers: H) {
    this.headers = headers;
    this.url = url;
  }
}
