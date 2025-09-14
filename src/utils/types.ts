import { PostgresDB } from "./db";

export type RouteContext = {
    request: Request;
    env: Env;
    ctx: ExecutionContext;
    db: PostgresDB
};

export type RouteHandler = (context: RouteContext) => Promise<Response>;

export type Route = {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    handler: RouteHandler;
};

export const NotAutorised = () => {
    return new Response("", {
        headers: {
            "Content-Type": "application/json",
        },
        status: 401,
    })
}