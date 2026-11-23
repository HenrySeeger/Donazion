
import jwt from "jsonwebtoken";

// Stores the JWT secret after it is retrieved.
let jwtSecret;

// Sets the JWT secret after retrieving it from Parameter Store.
export function setJwtSecret(secret) {
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET is missing or too short.");
    }

    jwtSecret = secret;
}

// Retrieves the JWT secret.
function getJwtSecret() {
    // Uses the local environment variable when running tests.
    const secret = jwtSecret || process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET is missing or too short.");
    }

    return secret;
}

// Generates a signed token for an authenticated organization.
export function generateToken(orgID, tokenVersion) {
    return jwt.sign(
        { orgID, tokenVersion },
        getJwtSecret(),
        {
            algorithm: "HS256",
            expiresIn: "1h",
        }
    );
}

// Verifies a JWT and retrieves its Organization ID and token version.
export function verifyToken(token) {
    const decoded = jwt.verify(token, getJwtSecret(), {
        algorithms: ["HS256"],
    });

    // Makes sure the token contains valid organization information.
    if (
        typeof decoded === "string" ||
        typeof decoded.orgID !== "number" ||
        !Number.isSafeInteger(decoded.orgID) ||
        decoded.orgID <= 0 ||
        typeof decoded.tokenVersion !== "number" ||
        !Number.isSafeInteger(decoded.tokenVersion) ||
        decoded.tokenVersion < 0
    ) {
        throw new Error("Invalid authentication token.");
    }

    return {
        orgID: decoded.orgID,
        tokenVersion: decoded.tokenVersion,
    };
}
