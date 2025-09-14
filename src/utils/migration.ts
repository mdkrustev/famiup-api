import { PostgresDB } from "./db"

export const migration = async (db: PostgresDB) => {
     await db.createTable("users", `
        id SERIAL PRIMARY KEY,
        parent_id SERIAL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        google_id TEXT UNIQUE NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    `)
}