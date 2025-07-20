
import { helloGet } from "./routes/main.route";
import { Route } from "./utils/types";

// Дефиниране на рутовете
export const routes: Route[] = [
    { method: "GET", path: "/hello", handler: helloGet },
];