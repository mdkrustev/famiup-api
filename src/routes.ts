import { loginGoogle, googleAuthCallback } from "./routes/login.route";
import { UserInfoHandler, UserLogoutHandler } from "./routes/main.route";
import { Route } from "./utils/types";

export const routes: Route[] = [    
    { method: "GET", path: "/google-login", handler: loginGoogle },
    { method: "GET", path: "/auth/callback", handler: googleAuthCallback },
    { method: "GET", path: "/auth/logout", handler: UserLogoutHandler},
    { method: "GET", path: "/api/user-info", handler: UserInfoHandler }
];