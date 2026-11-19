
import { handler } from "../lambda/organization/changePassword";
import { generateToken } from "../auth/tokens";
import bcrypt from "bcryptjs";
import { pool } from "../db/connection";

// Mocks the database so tests don't modify AWS RDS.
jest.mock("../db/connection", () => ({
    pool: {
        execute: jest.fn(),
    },
}));

// Allows tests to simulate MySQL query results.
const mockExecute = pool.execute as jest.Mock;

// Tests for the Change Password Lambda.
describe("Change Password", () => {

    // Reset database mocks before each test.
    beforeEach(() => {
        mockExecute.mockReset();
    });

    // Rejects requests without an authentication token.
    test("Rejects missing authentication token", async () => {
        const response = await handler({
            body: JSON.stringify({
                oldPassword: "password123",
                newPassword1: "newPassword123!",
                newPassword2: "newPassword123!",
            }),
            headers: {},
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe(
            "Authentication required."
        );
    });

    // Rejects requests containing an invalid token.
    test("Rejects invalid authentication token", async () => {
        const response = await handler({
            body: JSON.stringify({
                oldPassword: "password123",
                newPassword1: "newPassword123!",
                newPassword2: "newPassword123!",
            }),
            headers: {
                Authorization: "Bearer invalid-token",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe(
            "Invalid or expired token."
        );
    });

    // Rejects requests when the new passwords do not match.
    test("Rejects mismatched new passwords", async () => {
        // Generate a valid token for Organization 1234.
        const token = generateToken(1234, 0);

        // Attempts to change the password with mismatched entries.
        const response = await handler({
            body: JSON.stringify({
                oldPassword: "password123",
                newPassword1: "newPassword123!",
                newPassword2: "differentPassword123!",
            }),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Verifies that the request was rejected.
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe(
            "New passwords do not match."
        );
    });


    // Rejects password changes when the current password is incorrect.
    test("Rejects incorrect current password", async () => {
        // Creates a hash representing the stored password.
        const passwordHash = await bcrypt.hash("password123", 10);

        // Simulates the organization existing in MySQL.
        mockExecute.mockResolvedValueOnce([
            [{
                password_hash: passwordHash,
                token_version: 0,
            }],
            [],
        ]);

        // Generates a valid authentication token.
        const token = generateToken(1234, 0);

        // Attempts a password change using the wrong current password.
        const response = await handler({
            body: JSON.stringify({
                oldPassword: "wrongPassword",
                newPassword1: "newPassword123!",
                newPassword2: "newPassword123!",
            }),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Verifies that the password change was rejected.
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe(
            "Invalid organization or current password."
        );

        // Verify that the correct organization was queried.
        expect(mockExecute).toHaveBeenCalledWith(
            "SELECT password_hash, token_version FROM organizations WHERE org_id = ?",
            [1234]
        );

        expect(mockExecute).toHaveBeenCalledTimes(1);
        });

        // Verifies that a successful password change stores a bcrypt hash.
        test("Successfully changes Organization password", async () => {
        const oldPassword = "password123";
        const newPassword = "newPassword123!";

        // Create the organization's existing password hash.
        const oldPasswordHash = await bcrypt.hash(oldPassword, 10);

        // Simulates the SELECT query finding the organization.
        mockExecute.mockResolvedValueOnce([
            [{ password_hash: oldPasswordHash, token_version: 0 }],
            [],
        ]);

        // Simulates the UPDATE query changing one database row.
        mockExecute.mockResolvedValueOnce([
            { affectedRows: 1 },
            [],
        ]);

        // Generates a valid JWT for Organization 1234.
        const token = generateToken(1234, 0);

        // Submits the password change request.
        const response = await handler({
            body: JSON.stringify({
                oldPassword,
                newPassword1: newPassword,
                newPassword2: newPassword,
            }),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Verifies that the request succeeded.
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).message).toBe(
            "Password changed successfully."
        );

        // Retrieves the arguments passed to the UPDATE query.
        const updateCall = mockExecute.mock.calls.find(
            (call) => String(call[0]).includes("UPDATE organizations")
        );

        expect(updateCall).toBeDefined();

        // Retrieve all four parameters passed to the UPDATE query.
        const [
            newPasswordHash,
            updatedOrgID,
            previousHash,
            previousTokenVersion,
        ] = updateCall![1];

        // Confirm that the UPDATE increments the token version.
        expect(String(updateCall![0])).toContain(
            "token_version = token_version + 1"
        );

        // Confirm that the previous token version is checked.
        expect(String(updateCall![0])).toContain(
            "AND token_version = ?"
        );

        expect(previousTokenVersion).toBe(0);

        // Confirms the correct organization and previous hash were used.
        expect(updatedOrgID).toBe(1234);
        expect(previousHash).toBe(oldPasswordHash);

        // Confirms that the new password was hashed before storage.
        expect(newPasswordHash).not.toBe(newPassword);
        expect(await bcrypt.compare(newPassword, newPasswordHash)).toBe(true);
    });


        // Rejects authentication tokens issued before a password change.
        test("Rejects an outdated authentication token", async () => {
            // Create a JWT using the organization's old token version.
            const token = generateToken(1234, 0);

            // Simulates the database having a newer token version.
            mockExecute.mockResolvedValueOnce([
                [{
                    password_hash: await bcrypt.hash("password123", 10),
                    token_version: 1,
                }],
                [],
            ]);

            // Attempts to change the password using the outdated token.
            const response = await handler({
                body: JSON.stringify({
                    oldPassword: "password123",
                    newPassword1: "newPassword123!",
                    newPassword2: "newPassword123!",
                }),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // The old token must be rejected.
            expect(response.statusCode).toBe(401);
            expect(JSON.parse(response.body).message).toBe(
                "Authentication token is no longer valid."
            );

            // Verifies that the password was not updated.
            expect(mockExecute).toHaveBeenCalledTimes(1);
     });

});
