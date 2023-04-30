export const StatusCodeDescription = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
} as const;

export type StatusCode = keyof typeof StatusCodeDescription;

export type Method = "GET" | "POST" | "OPTIONS";
