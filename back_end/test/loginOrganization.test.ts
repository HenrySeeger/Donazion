import bcrypt from "bcryptjs";
import { pool } from "../db/connection";
import { verifyToken } from "../auth/tokens";

// Replace the real database connection with a mock.
jest.mock("../db/connection", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

// Allows tests to control the database query results.
const mockExecute = pool.execute as jest.Mock;


import { handler } from "../lambda/organization/loginOrganization";

// Tests for the Organization Login Lambda function.
describe("Login Organization", () => {

  // Checks that a request body is provided.
  test("Rejects missing request body", async () => {
    const response = await handler({ body: null });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      "Request body is required."
    );
  });

  // Checks that the request contains valid JSON.
  test("Rejects invalid JSON", async () => {
    const response = await handler({ body: "{invalid json}" });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      "Invalid JSON format."
    );
  });

  // Checks that the Organization ID is valid.
  test("Rejects invalid Organization ID", async () => {
    const response = await handler({
      body: JSON.stringify({
        orgID: -1,
        password: "password123",
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      "Valid Organization ID is required."
    );
  });

  // Checks that a password was provided.
  test("Rejects missing password", async () => {
    const response = await handler({
      body: JSON.stringify({
        orgID: 1234,
        password: "",
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      "Password is required."
    );
  });

  
  // Checks that an organization can log in with the correct password.
  test("Accepts correct Organization login credentials", async () => {
    // Creates a test password hash.
    const passwordHash = await bcrypt.hash("password123", 10);

    // Simulates the database returning the password hash and token version.
    mockExecute.mockResolvedValueOnce([
        [{
            password_hash: passwordHash,
            token_version: 0,
        }],
        [],
    ]);

    // Attempts to log in.
    const response = await handler({
      body: JSON.stringify({
        orgID: 1234,
        password: "password123",
      }),
    });

    // Verifies that login succeeded.
    expect(response.statusCode).toBe(200);

    const responseBody = JSON.parse(response.body);

    expect(responseBody.message).toBe("Login successful.");

    // Verifies that the response contains a signed JWT.
    expect(typeof responseBody.token).toBe("string");

    // Verifies that the token identifies the correct organization.
    const decodedToken = verifyToken(responseBody.token);
    expect(decodedToken.orgID).toBe(1234);

    // Verifies that the database was queried correctly.
    expect(mockExecute).toHaveBeenCalledWith(
        "SELECT password_hash, token_version FROM organizations WHERE org_id = ?",
        [1234]
    );
});


  // Checks that an incorrect password is rejected.
  test("Rejects incorrect Organization password", async () => {
    // Create a hash for the correct password.
    const passwordHash = await bcrypt.hash("password123", 10);

    // Simulate finding the organization in the database.
    mockExecute.mockResolvedValueOnce([
      [{ password_hash: passwordHash }],
      [],
    ]);

    // Attempt login with an incorrect password.
    const response = await handler({
      body: JSON.stringify({
        orgID: 1234,
        password: "wrongPassword",
      }),
    });

    // Verify that login was rejected.
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).message).toBe(
      "Invalid Organization ID or password."
    );
    });


  // Checks that an Organization ID not found in the database is rejected.
  test("Rejects nonexistent Organization ID", async () => {
    // Simulate a database query returning no organizations.
    mockExecute.mockResolvedValueOnce([
      [],
      [],
    ]);

    // Attempt login with an Organization ID that does not exist.
    const response = await handler({
      body: JSON.stringify({
        orgID: 9999,
        password: "password123",
      }),
    });

    // Verify that login was rejected.
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).message).toBe(
      "Invalid Organization ID or password."
    );
    });
 });
