import { IUser } from "../models/dbModels";
import { withAuth } from "../utils/middleware";
import { Ok } from "../utils/responses";

export const AccountsHandler = withAuth(async (context) => {
    const ownUsers = await context.db.query<IUser[]>(
        `SELECT * FROM users WHERE parent_id = $1  
         ORDER BY created_at DESC LIMIT 10`, [context.user?.id]
    )
    return Ok(ownUsers)
});


export const CreateAccountHandler = withAuth(async (context) => {
    const newUser = await context.db.insert<IUser>("users", {
        name: "Martin Krastev", email: null, parent_id: (context.user?.id) || null, google_id: null
    })
    return Ok(newUser)
});

export const UpdateAccountHandler = withAuth(async (context) => {
    const updatedAccount = await context.db.update<IUser>("users", {
        name: "Martin Krastev 2",
        
    }, 'id = $2', ['912bbcc3-d72d-4e8c-b396-0f6f0952b25a'])
    return Ok(updatedAccount)
});