import { env } from "cloudflare:workers";
import { SignJWT } from "jose";


export const generateToken = async (payload: { [key: string]: string | number | boolean }) => {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).sign(secret);
}

