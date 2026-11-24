
import mysql from "mysql2/promise";
import fs from "node:fs";
import { getSecret } from "./secrets.mjs";

let poolPromise;

// Creates the database connection using the existing configuration.
async function createPool() {
    const password = await getSecret("/donazion/prod/DB_PASSWORD");

    return mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password,
        database: process.env.DB_NAME,

        // Verifies the AWS RDS SSL certificate.
        ssl: {
            ca: fs.readFileSync(
                "certs/global-bundle.pem",
                "utf8"
            ),
            rejectUnauthorized: true,
        },

        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
    });
}

// Creates and reuses the connection pool.
async function getPool() {
    if (!poolPromise) {
        poolPromise = createPool().catch((error) => {
            poolPromise = undefined;
            throw error;
        });
    }

    return poolPromise;
}

// Allows other files to execute database queries.
export const pool = {
    execute: async (sql, values) => {
        const connectionPool = await getPool();
        return connectionPool.execute(sql, values);
    },
};

