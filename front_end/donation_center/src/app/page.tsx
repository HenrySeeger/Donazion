"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link"
import styles from "./page.module.css";

export default function Home() {
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function registerDonationCenter(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const registration = {

      name: String(form.get("name") ?? "").trim(),
      streetAddress: String(form.get("streetAddress") ?? "").trim(),
      latitude: Number(form.get("latitude")),
      longitude: Number(form.get("longitude")),
      username: String(form.get("username") ?? "").trim(),
      password: String(form.get("password") ?? ""),

    };

    if (
      !registration.name ||
      !registration.streetAddress ||
      !registration.username ||
      !registration.password.trim()
    ) {
      setMessage("Fill in all registration fields.");
      return;
    }

    // setMessage( `Ready to register ${registration.name}.`)

    const apiURL = process.env.NEXT_PUBLIC_DONAZION_API_URL;

    if (!apiURL) {
      setMessage("Registraion API URL is missing");
      return;
    }

    setMessage("")
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiURL}/registerDonationCenter`, {

        method: "POST", 
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(registration),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(result?.error || result?.message || "Registration failed");
        return;
      }

      setMessage(result?.message || "API returned an unexpected response");
    } catch {
      setMessage("Could not reach registration API");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    
    <div className={styles.page}>

      <main  className={styles.main}>

        <form
    
          className={styles.intro}
          onSubmit={registerDonationCenter}
          onChange={() => setMessage("")}>

          <h1> Register Donation Center </h1>

          <label>
            Donation center name <br/>
            <input name="name" autoComplete= "organization" required />
          </label>

          <label>
            Street Address <br/>
            <input name="streetAddress" autoComplete="street-address" required />
          </label>

          <label>
            Latitude <br/>
            <input name="latitude" type="number" step="any" min="-90" max="90" required />
          </label>

          <label>
            Longitude <br/>
            <input name="longitude" type="number" step="any" min="-180" max="180" required />
          </label>

          <label>
            Username <br/>
            <input name="username" autoComplete="username" required />
          </label>

          <label>
            Password <br/>
            <input name="password" type="password" autoComplete="new-password" required />
          </label>

          <button type="submit" disabled={isSubmitting}> 
            {isSubmitting ? "Submitting" : "Register"}
          </button>

          <p role="status">{message}</p>
          <Link href="/login">Already registered? Log in</Link>

        </form>
 
      </main>
 
    </div>
  );

}