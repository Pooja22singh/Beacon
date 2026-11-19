import pg from 'pg'

// Every copy of a service has its own pool. Keep copies x DB_POOL_MAX under the database limit.
export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 5),
})
