// src/index.ts
import { routes } from "./routes";
import { NotFound } from "./utils/responses";
import { Route, RouteHandler } from "./utils/types";
import { PostgresDB } from './utils/db'
import { DurableObject } from "cloudflare:workers";

const db = new PostgresDB();

export class MyDurableObject extends DurableObject<Env> {
  // Map на стая -> Set от WebSocket връзки
  rooms: Map<string, Set<WebSocket>>;



  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.rooms = new Map();

  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const room = parts[parts.length - 1] || "default";

    // --- WebSocket Upgrade ---
    if (request.headers.get("Upgrade") === "websocket") {
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();

      let connections = this.rooms.get(room);
      if (!connections) {
        connections = new Set();
        this.rooms.set(room, connections);
      }
      connections.add(server);

      // Получаване и препращане на съобщения
      server.addEventListener("message", (event) => {

        for (const conn of connections!) {
          if (conn !== server) {
            try {
              console.log('room', room, event.data)
              conn.send(event.data);

            } catch { connections!.delete(conn); }
          }
        }
      });

      // Почистване при затваряне на връзка
      server.addEventListener("close", () => {
        connections!.delete(server);
        if (connections!.size === 0) this.rooms.delete(room);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // --- HTTP POST за изпращане на съобщение към стая ---
    if (request.method === "POST") {
      try {
        const data: any = await request.json();
        const msg = data.message || "";

        const connections = this.rooms.get(room);
        if (connections) {
          for (const conn of connections) {
            try {
              conn.send(msg);
            } catch { connections.delete(conn); }
          }
        }

        return new Response(JSON.stringify({ ok: true, sentTo: connections?.size || 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  }


}

function matchRoute(routes: Route[], request: Request): RouteHandler | null {


  const url = new URL(request.url);
  const pathname = url.pathname;

  for (const route of routes) {
    const methodMatch = route.method === request.method;
    const pathMatch = pathname === route.path;
    if (methodMatch && pathMatch)
      return route.handler;
  }
  return null;
}


export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {

    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": env.CLIENT_URI,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        },
      });
    }

    if (url.pathname.startsWith("/api/ws/")) {
      const id = env.MY_DURABLE_OBJECT.idFromName("loginroom");
      const obj = env.MY_DURABLE_OBJECT.get(id);
      return obj.fetch(request);
    }

    db.connect(env.DATABASE_URL)
    const handler = matchRoute(routes, request);
    if (handler) {
      const queryParam = (param: string) => {
        return url.searchParams.get(param);
      }
      return handler({ request, env, ctx, db, user: null, queryParam });
    }
    return NotFound()
  },
};