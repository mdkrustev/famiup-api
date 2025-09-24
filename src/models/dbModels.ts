import { Guid } from "../utils/types";

export interface IUser {
    id: string,
    email: string | null,
    google_id: string | null,
    name: string,
    parent_id: string | null, 
    loginroom_id?: string | null
}