import { getUserInfo } from "./auth";
import { NotAuthorised, RouteContext } from "./types";

export const withAuth = <T extends RouteContext>(handler: (context: T) => Promise<Response>) => {
    return async (context: T): Promise<Response> => {
        const user = await getUserInfo(context);
        if (!user) {
            return NotAuthorised();
        }
        return handler({ ...context, user });
    };
};

export type RouteHandler = (context: RouteContext) => Promise<Response>;

export const compose = (...middlewares: ((next: RouteHandler) => RouteHandler)[]): ((handler: RouteHandler) => RouteHandler) => {
  return (handler: RouteHandler): RouteHandler => {
    return middlewares.reduceRight(
      (acc: RouteHandler, middleware: (next: RouteHandler) => RouteHandler) => {
        return middleware(acc);
      },
      handler
    );
  };
};