import { BadRequest, Ok, Redirect } from "../utils/responses";
import { RouteContext } from "../utils/types";
import { IUser } from "../models/dbModels";
import { sendSocketMessage } from "../utils/wsListener";
import { generateToken } from "../utils/token";
import { createSessionCookie } from "../utils/auth";

const googleOAuth2 = "https://accounts.google.com/o/oauth2/v2/auth";
const getOAuthToken = "https://oauth2.googleapis.com/token"
const getGoogleInfo = "https://www.googleapis.com/oauth2/v3/tokeninfo"

export const loginGoogle = async (context: RouteContext) => {

    const loginRoomId = context.queryParam('loginRoomId');

    // 1. Redirect to Google OAuth
    const googleAuthUrl = new URL(googleOAuth2);
    googleAuthUrl.searchParams.set("client_id", context.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", context.env.REDIRECT_URI);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    googleAuthUrl.searchParams.set("state", loginRoomId);
    console.log("Redirect URL:", googleAuthUrl.toString());
    return Redirect(googleAuthUrl.toString())
};

export const googleAuthCallback = async (context: RouteContext) => {

    // 2. Handle OAuth callback
    const code = context.queryParam("code");
    const loginRoomId = context.queryParam('state');
    if (!code) return BadRequest("Missing code");
    if (!loginRoomId) return BadRequest("Missing state");

    // Exchange code for tokens
    const tokenResponse = await fetch(getOAuthToken, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: context.env.GOOGLE_CLIENT_ID,
            client_secret: context.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: context.env.REDIRECT_URI,
            grant_type: "authorization_code",
        }),
    });

    const tokens: any = await tokenResponse.json();

    if (tokens.id_token) {
        const userInfoResponse = await fetch(getGoogleInfo, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                id_token: tokens.id_token
            }),
        });
        const userInfo: any = await userInfoResponse.json();
        const user = await context.db.insertOrUpdate<IUser>('users', {
            name: `${userInfo.given_name} ${userInfo.family_name}`,
            google_id: userInfo.sub,
            email: userInfo.email,
            parent_id: null,
            loginroom_id: loginRoomId
        }, 'email')

        if (user) {
            const token = await generateToken({ id: user.id });
            const cookie = createSessionCookie(token, 3600 * 24 * 7);
            const html = LOGIN_POPUP_HTML;
            await sendSocketMessage(loginRoomId, "login", user);
            return new Response(html, {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=UTF-8",
                    "Set-Cookie": cookie,
                },
            });
        }
    }
    return Ok('')
}

export const AuthCheckLoginHandler = async(context: RouteContext) => {
    //context.user
    return Ok({isAuth: context.user ? true : false, checkReady: true, loggedUsed: context.user})
}

const LOGIN_POPUP_HTML = `<!DOCTYPE html>
<html>
  <body>
    <script>
      if (window.opener) {
        window.close();
      }
    </script>
  </body>
</html>`;
