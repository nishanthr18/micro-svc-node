import { getPool } from "shared";
import { User } from "../types/auth.types";

export const createUser = async (payload: User): Promise<User | null> => {
    const query =
        `
        INSERT INTO users(name, email, password_hash, role)
        VALUES($1, $2, $3, $4)
        RETURNING name, email, role, created_at
    `

    const { name, email, password_hash, role } = payload;
    const values = [name, email, password_hash, role ?? 'USER'];

    const result = await getPool().query(query, values);

    return result.rows[0];
}

export const findByEmail = async (email: string): Promise<boolean> => {
    const query = `SELECT email FROM users WHERE email = $1`
    const result = await getPool().query(query, [email]);
    return (result.rowCount ?? 0) > 0;
};

export const getUser = async(email: string): Promise<User | null> =>{
    const query = `SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1`;
    const result = await getPool().query<User>(query, [email]);
    return result.rows[0] ?? null;
}