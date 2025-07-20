// src/routes/main.route.ts

import { Ok } from "../utils/responses";
import { type RouteContext } from "../utils/types";

export const helloGet = async (context: RouteContext) => {
    
    interface DataInterface {
        message: string,
        timestamp: number
    }

    const data: DataInterface = {
        message: "GET: Hello from /hello бе гъз",
        timestamp: Date.now(),
    };

    return Ok(data);
};
