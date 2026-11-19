import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { pool } from "../../db/connection";
import { generateToken, setJwtSecret } from "../../auth/tokens";
import { getSecret } from "../../config/secrets";

// Handles login requests for an Organization account

// The information that was sent by the frontend
interface LoginRequest {
    orgID: number;
    password: string;
}

// Response returned by the Lambda function
interface LoginResponse {
    statusCode: number;
    body: string;
}

// Processes an Organization login request
export async function handler(event: { body: string | null }): Promise<LoginResponse> {
    let loginData: LoginRequest;

    // Checks whether the request contains a body
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is required." }),
        };
    }

    // Converts the JSON request body into an object
    try {
        loginData = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid JSON format." }),
        };
    }

    // Makes sure the Organization ID is a positive integer
    if (
        typeof loginData?.orgID !== "number" ||
        !Number.isSafeInteger(loginData.orgID) ||
        loginData.orgID <= 0
    ) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Valid Organization ID is required." }),
        };
    }


    // Makes sure a password was provided
    if (typeof loginData?.password !== "string" || !loginData.password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Password is required." }),
        };
    }

    // Looks up the organization's stored password hash.
    try {
        // Retrieves the JWT signing secret from AWS Parameter Store.
        const jwtSecret = await getSecret("/donazion/prod/JWT_SECRET");
        setJwtSecret(jwtSecret);
        
        const [rows] = await pool.execute<RowDataPacket[]>(
           "SELECT password_hash, token_version FROM organizations WHERE org_id = ?",
            [loginData.orgID]
        );

        // Checks the password without revealing whether the ID exists.
        const passwordMatches =
            rows.length > 0 &&
            (await bcrypt.compare(
                loginData.password,
                rows[0].password_hash
            ));

        if (!passwordMatches) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Invalid Organization ID or password.",
                }),
            };
        }

       // Include the organization's current token version in the JWT.
        const token = generateToken(
            loginData.orgID,
            rows[0].token_version
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Login successful.",
                token: token,
            }),
        };
            } catch (error) {
                console.error("Organization authentication failed.");

                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Internal server error.",
                    }),
                };
    }
}