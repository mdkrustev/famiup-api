import { getUserInfo } from "../utils/auth";
import { Ok } from "../utils/responses";
import { NotAutorised, RouteContext } from "../utils/types";
import { sendSocketMessage } from "../utils/wsListener";

export const UserInfoHandler = async (context: RouteContext) => {
    const user = await getUserInfo(context);
    if (!user) return NotAutorised()
    return Ok(user)
};

export const UserLogoutHandler = async (context: RouteContext) => {
    const cookie = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
    const message = 'User has been logged out';
    await sendSocketMessage('loginroom', 'logout', message)
    return Ok(message, {"Set-Cookie": cookie})
}
