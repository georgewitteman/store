import { Readable } from "node:stream";

const css = `
  body {
    background: #ffffff;
    color: #333333;
    font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 1rem;
    font-style: normal;
    font-weight: normal;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
    margin: 0;
    text-rendering: optimizeLegibility;
    max-width: 24rem;
    margin: 0.5rem auto;
  }
`;

export async function page() {
  return Readable.from(
    html(
      head(
        title("The page title"),
        link({rel: "stylesheet", type: "text/css", href: "styles.css"}),
        // style(css),
      ),
      body(
        PageComponent(),
      ),
    ),
  )
}

function PageComponent() {
  return div(
    null,
    h1("Heading 1"),
    ...("This is some body content".split(" ").map(s => span(null, s))),
  )
}

function div(attributes, ...children) {
  return el("div", attributes, ...children);
}

function span(attributes, ...children) {
  return el("span", attributes, ...children);
}

function style(cssContent) {
  return el("style", null, cssContent);
}

function link(attributes) {
  return el("link", attributes);
}

function h1(str, attributes) {
  return el("h1", attributes, str)
}

function title(titleString) {
  return el("title", null, titleString);
}

function head(...children) {
  return el("head", null, ...children);
}

function body(...children) {
  return el("body", null, ...children);
}

function html(head, body) {
  return `<!doctype html>${el("html", {lang: "en"}, head, body)}`
}

function el(tagName, attributes, ...children) {
  if (['link'].includes(tagName)) {
    if (children.length > 0) {
      throw new Error(`${tagName} can not have children`)
    }
    let result = `<${tagName}`;
    if (attributes) {
      result += ` ${
        Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
      }`;
    }
    return `${result} />`;
  }
  let result = `<${tagName}`;
  if (attributes) {
    result += ` ${
      Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
    }`;
  }
  return `${result}>${children.join("")}</${tagName}>`
}
