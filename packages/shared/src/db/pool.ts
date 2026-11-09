import { Pool } from 'pg';

let pool: Pool | null = null;

export const getPool = (): Pool => {
    if (!pool) {
        const connString = process.env.DB_URL;

        if (!connString) {
            throw new Error('Database url not set')
        };

        pool = new Pool({ connectionString: connString });
    };

    return pool;
}

export const closePool = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        pool = null;
    }
}