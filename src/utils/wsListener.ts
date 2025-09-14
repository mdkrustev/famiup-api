import { env } from "cloudflare:workers";

type roomTypes = 'loginroom';
type actionTypes = 'login' | 'logout'

export const sendSocketMessage = async (room: roomTypes, action: actionTypes, message: any) => {
    const roomId = env.MY_DURABLE_OBJECT.idFromName('loginroom')
    const roomObj = env.MY_DURABLE_OBJECT.get(roomId);
    await roomObj.fetch(`${env.API_URI}/api/ws/${room}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: JSON.stringify({ message, action, room }) }),
    });
}