// src/utils/responses.ts
import { env } from "cloudflare:workers";

const corsHeader = {
  "Access-Control-Allow-Origin": env.CLIENT_URI,
  "Access-Control-Allow-Credentials": "true",
}

export const Ok = (body: string | any = "OK", headers = {}) => {

  const isObject = typeof body === "object" && body !== null;
  if (isObject) {
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        ...corsHeader,
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }
  return new Response(String(body), {
    status: 200,
    headers: {
      ...corsHeader,
      ...headers,
      "Content-Type": "text/html",
    },
  });
};

export const Created = (body: string = "Created", headers = {}) => {
  return new Response(body, {
    status: 201,
    headers: {
      ...corsHeader,
      ...headers,
      "Content-Type": "text/plain",
    },
  });
};

export const BadRequest = (body: string = "Bad Request", headers = {}) => {
  return new Response(body, {
    status: 400,
    headers: {
      ...corsHeader,
      ...headers,
      "Content-Type": "text/plain",
    },
  });
};

export const Unauthorized = (body: string = "Unauthorized", headers = {}) => {
  return new Response(body, {
    status: 401,
    headers: {
      ...corsHeader,
      ...headers,
      "Content-Type": "text/plain",
    },
  });
};

export const Forbidden = (body: string = "Forbidden", headers = {}) => {
  return new Response(body, {
    status: 403,
    headers: {
      ...corsHeader,
      ...headers,
      "Content-Type": "text/plain",
    },
  });
};

export const NotFound = (body: string = "Not Found") => {
  return new Response(body, {
    status: 404,
    headers: {
      ...corsHeader,
      "Content-Type": "text/plain",
    },
  });
};

export const ServerError = (body: string = "Internal Server Error", headers = {}) => {
  return new Response(body, {
    status: 500,
    headers: {
      ...corsHeader,
      ...headers,
      "Content-Type": "text/plain",
    },
  });
};

export const Redirect = (location: string, headers = {}) => {
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeader,
      ...headers,
      Location: location,
    },
  });
};