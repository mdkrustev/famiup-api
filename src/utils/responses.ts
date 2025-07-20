// src/utils/responses.ts

export const Ok = (body: string | any = "OK") => {
  const isObject = typeof body === "object" && body !== null;
  if (isObject) {
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(String(body), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const Created = (body: string = "Created") => {
  return new Response(body, {
    status: 201,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const BadRequest = (body: string = "Bad Request") => {
  return new Response(body, {
    status: 400,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const Unauthorized = (body: string = "Unauthorized") => {
  return new Response(body, {
    status: 401,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const Forbidden = (body: string = "Forbidden") => {
  return new Response(body, {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const NotFound = (body: string = "Not Found") => {
  return new Response(body, {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const ServerError = (body: string = "Internal Server Error") => {
  return new Response(body, {
    status: 500,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const Redirect = (location: string) => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
    },
  });
};