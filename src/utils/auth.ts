import { jwtVerify } from "jose";
import { RouteContext } from "./types";
import { IUser } from "../models/dbModels";

export const getToken = (context: RouteContext) => {
    const cookieHeader = context.request.headers.get("Cookie");
    const match = cookieHeader?.match(/session=([^;]+)/);
    return match ? match[1] : null;
}

export const getUserInfo = async (context: RouteContext) => {
    const token = getToken(context)
    const userId = await getUserIdFromToken(token, context.env.JWT_SECRET)
    const user = await context.db.first<IUser>('SELECT * FROM users WHERE id = $1', [userId])
    if (user) return user;
    return null;
}

async function getUserIdFromToken(token: string | null, secretString: string) {
    if (token) {
        const secret = new TextEncoder().encode(secretString);
        try {
            const { payload } = await jwtVerify(token, secret);
            return payload.id;
        } catch (err: any) {
            console.error("Invalide token:", err.message);
            return null;
        }
    }
    return null;
}

export const createSessionCookie = (token: string, maxAge: number): string => {
    return `session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}