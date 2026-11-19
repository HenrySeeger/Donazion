
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "node:fs";

// Loads local database credentials.
dotenv.config({ path: ".env.local" });

// Tests the database connection.
async function testConnection() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                ca: fs.readFileSync(
                    "C:\\Users\\pbeau\\Downloads\\global-bundle.pem",
                    "utf8"
                ),
                rejectUnauthorized: true,
            },
        });

        // Confirms that the organizations table exists.
        const [rows] = await connection.query(
            "SELECT org_id FROM organizations LIMIT 5"
        );

        console.log("Database connection successful!");
        console.log("Organization records:", rows);
        // Check whether the test password matches the stored hash.

        const [passwordRows] = await connection.query(
            "SELECT password_hash FROM organizations WHERE org_id = ?",
            [1234]
        );

        const organizations = passwordRows as { password_hash: string }[];

        if (organizations.length === 0) {
            throw new Error("Test organization not found.");
        }

        const bcrypt = await import("bcryptjs");

        const passwordMatches = await bcrypt.compare(
            "password123",
            organizations[0].password_hash
        );

        console.log("Password verification successful:", passwordMatches);
    
    } catch (error) {
        console.error("Database connection failed.");

        // Avoids printing connection details or credentials.
        if (error instanceof Error) {
            console.error("Error type:", error.name);
        }

        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testConnection();
