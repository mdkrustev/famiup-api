// src/index.ts
import { routes } from "./routes";
import { NotFound } from "./utils/responses";
import { Route, RouteHandler } from "./utils/types";



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
		const handler = matchRoute(routes, request);
		if (handler) {
			return handler({ request, env, ctx });
		}
		return NotFound()
	},
};


//psql 'postgresql://neondb_owner:npg_oXUvj1hdcuP4@ep-young-frog-a2454omj-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'