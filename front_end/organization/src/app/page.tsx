'use client'

import React from 'react';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { awsInstance } from './AWS';

export default function Home() {
  const router = useRouter();

  const [orgID, setOrgID] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Handles Organization login.
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Validates the Organization ID.
    const id = Number(orgID);

    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Please enter a valid Organization ID.");
      return;
    }

    setLoading(true);

    try {
      // Sends the login credentials to AWS.
      const response = await awsInstance.post("loginOrganization", {
        orgID: id,
        password: password
      });

      const result = typeof response.data.body === "string"
        ? JSON.parse(response.data.body)
        : response.data;

      const statusCode = response.data.statusCode ?? response.status;

      // Checks whether login was successful.
      if (statusCode !== 200 || typeof result.token !== "string") {
        setError(result.message || "Login failed.");
        return;
      }

      // Stores the authentication token for this browser session.
      sessionStorage.setItem("organizationToken", result.token);

      // Opens the Organization dashboard.
      router.push("/dashboard");

    } catch {
      setError("Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Organization Login</h1>

      <form
        onSubmit={login}
        className={styles.box}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "90%",
          maxWidth: "400px"
        }}
      >
        <label htmlFor="orgID">Organization ID</label>

        <input
          id="orgID"
          type="number"
          min="1"
          value={orgID}
          onChange={(event) => setOrgID(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p role="alert" style={{color: "red"}}>{error}</p>
        )}
      </form>
    </div>
  );
}
