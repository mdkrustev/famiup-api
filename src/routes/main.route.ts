import { getUserInfo } from "../utils/auth";
import { withAuth } from "../utils/middleware";
import { Ok } from "../utils/responses";
import { RouteContext } from "../utils/types";
import { sendSocketMessage } from "../utils/wsListener";

export const UserInfoHandler = async (context: RouteContext) => {
      const user = await getUserInfo(context);
     return Ok({isAuth: user ? true : false, checkReady: true, loggedUser: user})
};

export const UserLogoutHandler = withAuth(async (context) => {
    const cookie = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
    const message = `User (${context.user?.email}) has been logged out`;
    await sendSocketMessage(context.user?.loginroom_id || null, "logout", message);
    console.log('logout', context.user)
    return Ok(message, {
        "Set-Cookie": cookie,
    });
});

export const EnvironmentHandler = async (context: RouteContext) => {
    const cookie = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
    
    return Ok({
        api: context.env.API_URI,
        client: context.env.CLIENT_URI
    });
};


