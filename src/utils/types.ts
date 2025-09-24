import { IUser } from "../models/dbModels";
import { PostgresDB } from "./db";

export type RouteContext = {
    request: Request;
    env: Env;
    ctx: ExecutionContext;
    db: PostgresDB,
    user?: IUser | null,
    queryParam: (parm: string) => any
};

export type RouteHandler = (context: RouteContext) => Promise<Response>;

export type Route = {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    handler: RouteHandler;
};

export const NotAuthorised = () => {
    return new Response("", {
        headers: {
            "Content-Type": "application/json",
        },
        status: 401,
    })
}


export type Guid = string & { readonly __brand: unique symbol };