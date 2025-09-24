import { loginGoogle, googleAuthCallback, AuthCheckLoginHandler } from "./routes/login.route";
import { EnvironmentHandler, UserInfoHandler, UserLogoutHandler } from "./routes/main.route";
import { AccountsHandler, CreateAccountHandler, UpdateAccountHandler } from "./routes/user.route";

import { Route } from "./utils/types";

export const routes: Route[] = [    
    { method: "GET", path: "/api/environment", handler: EnvironmentHandler },
    { method: "GET", path: "/google-login", handler: loginGoogle },
    { method: "GET", path: "/auth/callback", handler: googleAuthCallback },
    { method: "GET", path: "/auth/logout", handler: UserLogoutHandler},
    { method: "GET", path: "/auth/check-login", handler: AuthCheckLoginHandler},
    { method: "GET", path: "/api/user/info", handler: UserInfoHandler },
    { method: "GET", path: "/api/user/accounts", handler: AccountsHandler},
    { method: "GET", path: "/api/user/create-account", handler: CreateAccountHandler},
    { method: "GET", path: "/api/user/update-account", handler: UpdateAccountHandler}
];