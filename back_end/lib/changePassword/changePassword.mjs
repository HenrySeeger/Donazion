
import { verifyToken, setJwtSecret } from "./tokens.mjs";
import { getSecret } from "./secrets.mjs";
import bcrypt from "bcryptjs";
import { pool } from "./connection.mjs";

// Allows the frontend to read responses from this Lambda.
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
};

// Handles an organization's password change request.
export const handler = async (event) => {

    // Retrieves the Authorization header.
    const authorization = Object.entries(event.headers || {})
        .find(([key]) => key.toLowerCase() === "authorization")?.[1];

    // Requires a Bearer token.
    if (!authorization?.startsWith("Bearer ")) {
        return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Authentication required." }),
        };
    }

    // Verifies the JWT before processing the password change.
    let orgID;
    let tokenVersion;

    try {
        // Retrieves the JWT signing secret from AWS Parameter Store.
        const jwtSecret = await getSecret("/donazion/prod/JWT_SECRET");
        setJwtSecret(jwtSecret);

        const decodedToken = verifyToken(authorization.slice(7));
        orgID = decodedToken.orgID;
        tokenVersion = decodedToken.tokenVersion;
    } catch {
        return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Invalid or expired token." }),
        };
    }

    // Makes sure the request contains a body.
    if (!event.body) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Request body is required." }),
        };
    }

    // Parses the password change request.
    let passwordData;

    try {
        passwordData = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Invalid JSON format." }),
        };
    }

    // Checks that all password fields are provided.
    if (
        typeof passwordData?.oldPassword !== "string" ||
        !passwordData.oldPassword ||
        typeof passwordData?.newPassword1 !== "string" ||
        !passwordData.newPassword1 ||
        typeof passwordData?.newPassword2 !== "string" ||
        !passwordData.newPassword2
    ) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: "All password fields are required." }),
        };
    }

    // Makes sure both new password entries match.
    if (passwordData.newPassword1 !== passwordData.newPassword2) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: "New passwords do not match." }),
        };
    }

    // Retrieves the organization's existing password hash.
    try {
        // Retrieve the organization's password hash and current token version.
        const [rows] = await pool.execute(
            "SELECT password_hash, token_version FROM organizations WHERE org_id = ?",
            [orgID]
        );

        // Rejects the request if the organization doesn't exist.
        if (rows.length === 0) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: "Invalid organization or current password.",
                }),
            };
        }

        // Rejects tokens issued before the organization's last password change.
        if (rows[0].token_version !== tokenVersion) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: "Authentication token is no longer valid.",
                }),
            };
        }

        // Verifies the current password against the stored hash.
        const passwordMatches = await bcrypt.compare(
            passwordData.oldPassword,
            rows[0].password_hash
        );

        if (!passwordMatches) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: "Invalid organization or current password.",
                }),
            };
        }

        // Prevents the organization from reusing its current password.
        if (passwordData.newPassword1 === passwordData.oldPassword) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: "New password must be different from the current password.",
                }),
            };
        }

        // Requires a minimum password length.
        if (passwordData.newPassword1.length < 12) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: "New password must contain at least 12 characters.",
                }),
            };
        }

        // Hashes the new password before storing it.
        const newPasswordHash = await bcrypt.hash(
            passwordData.newPassword1,
            12
        );

        // Updates the password and invalidates previously issued tokens.
        const [result] = await pool.execute(
            `UPDATE organizations
            SET password_hash = ?, token_version = token_version + 1
            WHERE org_id = ? AND password_hash = ? AND token_version = ?`,
            [
                newPasswordHash,
                orgID,
                rows[0].password_hash,
                tokenVersion,
            ]
        );

        // Another request may have changed the password first.
        if (result.affectedRows !== 1) {
            return {
                statusCode: 409,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: "Password changed elsewhere. Please try again.",
                }),
            };
        }

        // Confirms that the new password was saved.
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "Password changed successfully.",
            }),
        };

    } catch {
        // Handles database or password hashing errors.
        console.error("Password change failed.");

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "Internal server error.",
            }),
        };
    }
};
