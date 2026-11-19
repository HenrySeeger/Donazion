
import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";
import type { QueryResult, FieldPacket } from "mysql2";
import fs from "node:fs";
import { getSecret } from "../config/secrets";

// Stores the database pool after it is created.
let poolPromise: Promise<Pool> | undefined;

// Retrieves the password and creates the MySQL connection pool.
async function createPool(): Promise<Pool> {
    const password = await getSecret("/donazion/prod/DB_PASSWORD");

    return mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password,
        database: process.env.DB_NAME,

        // Verify the AWS RDS SSL certificate.
        ssl: {
            ca: fs.readFileSync(
                process.env.DB_CA_PATH || "certs/global-bundle.pem",
                "utf8"
            ),
            rejectUnauthorized: true,
        },

        // Reuse connections between database requests.
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
    });
}

// Creates the pool only once and reuses it.
async function getPool(): Promise<Pool> {
    if (!poolPromise) {
        poolPromise = createPool().catch((error) => {
            poolPromise = undefined;
            throw error;
        });
    }

    return poolPromise;
}

// Preserves the existing pool.execute() interface.
export const pool: {
    execute<T extends QueryResult>(
        sql: string,
        values?: any
    ): Promise<[T, FieldPacket[]]>;
} = {
    execute: async <T extends QueryResult>(
        sql: string,
        values?: any
    ): Promise<[T, FieldPacket[]]> => {
        const connectionPool = await getPool();
        return connectionPool.execute<T>(sql, values);
    },
};


