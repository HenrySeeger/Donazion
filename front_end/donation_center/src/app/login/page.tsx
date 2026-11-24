"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link"
import styles from "../page.module.css";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [session, setSession] = useState <{ name: string; token: string } | null>(null)
 
  async function loginDonationCenter(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    
    const form = new FormData(event.currentTarget);

    const login = {

      //streetAddress: String(form.get("streetAddress") ?? "").trim(),
      //latitude: Number(form.get("latitude")),
      //longitude: Number(form.get("longitude")),
      username: String(form.get("username") ?? "").trim(),
      password: String(form.get("password") ?? ""),

    };

    if (!login.username || !login.password.trim()) {
        setMessage("Enter username and password");
        return;
    }

    const apiURL = process.env.NEXT_PUBLIC_DONAZION_API_URL;

    if (!apiURL) {
        setMessage("Login API URL missing")
        return;
    }

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiURL}/loginDonationCenter`, {

        method: "POST", 
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(login),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(result?.error || result?.message || "Login failed");
        return;
      }


      if (
        typeof result?.name !== "string" || !result.name ||
        typeof result.token !== "string" || !result.token ) {
        setMessage("The API returned an unexpected response");
        return;
        }
      
      setSession({ name: result.name, token: result.token });
    } catch {
      setMessage("Could not reach the login API");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <main  className={styles.main}>
        {session ? (
            <h1> Signed in as {session.name} </h1>) :
            (
            <form
              className={styles.intro}
              onSubmit={loginDonationCenter}
              onChange={() => setMessage("")}>

              <h1> Donation Center Login </h1>

              <label>
                  Username <br/>
                  <input name="username" autoComplete="username" required />
              </label>

              <label>
                  Password <br/>
                  <input name="password" type="password" autoComplete="current-password" required />
              </label>

              <button type="submit" disabled={isSubmitting}> 
                {isSubmitting ? "Signing in" : "Log in"}
              </button>

              <p role="status">{message}</p>
              <Link href= "/"> Register a donation center </Link>
            </form>
        )}
      </main>
    </div>
  );
}