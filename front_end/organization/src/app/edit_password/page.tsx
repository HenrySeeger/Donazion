
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from "../page.module.css"
import Nav from "../page_navigation"
import { awsInstance } from "../AWS"

export default function Home() {

  const router = useRouter()

  // Stores the password inputs.
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword1, setNewPassword1] = useState("")
  const [newPassword2, setNewPassword2] = useState("")

  // Stores feedback and loading status.
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirects users who are not logged in.
  useEffect(() => {
    if (!sessionStorage.getItem("organizationToken")) {
      router.replace("/")
    }
  }, [router])

  // Sends the password change request.
  async function changePassword() {

    setMessage("")

    const token = sessionStorage.getItem("organizationToken")

    if (!token) {
      router.replace("/")
      return
    }

    // Checks that every field is filled.
    if (!oldPassword || !newPassword1 || !newPassword2) {
      setMessage("All password fields are required.")
      return
    }

    // Checks that the new passwords match.
    if (newPassword1 !== newPassword2) {
      setMessage("New passwords do not match.")
      return
    }

    // Checks the minimum password length.
    if (newPassword1.length < 12) {
      setMessage("New password must contain at least 12 characters.")
      return
    }

    // Prevents reuse of the current password.
    if (oldPassword === newPassword1) {
      setMessage("New password must be different from the current password.")
      return
    }

    setLoading(true)

    try {

      // Sends the request with the authentication token.
      const response = await awsInstance.post(
        "changePassword",
        {
          oldPassword,
          newPassword1,
          newPassword2
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Handles both direct and wrapped API responses.
      const result =
        typeof response.data.body === "string"
          ? JSON.parse(response.data.body)
          : response.data

      const statusCode =
        response.data.statusCode ?? response.status

      if (statusCode !== 200) {
        setMessage(result.message || "Password change failed.")
        return
      }

      // Removes the old authentication token.
      sessionStorage.removeItem("organizationToken")

      // Returns the user to the login page.
      alert("Password changed successfully. Please log in again.")
      router.replace("/")

    } catch (error: unknown) {

      // Displays the backend error message.
      const requestError = error as {
        response?: {
          data?: {
            message?: string
            body?: string
          }
        }
      }

      const data = requestError.response?.data

      let errorMessage = data?.message || "Unable to change password."

      if (typeof data?.body === "string") {
        try {
          errorMessage = JSON.parse(data.body).message || errorMessage
        } catch {
          // Keeps the original error message.
        }
      }

      setMessage(errorMessage)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      <Nav current_page="edit password"/>

      <h1>Edit Password</h1>

      <input
        type="password"
        placeholder="Enter existing password"
        autoComplete="current-password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter new password"
        autoComplete="new-password"
        value={newPassword1}
        onChange={(e) => setNewPassword1(e.target.value)}
      />

      <input
        type="password"
        placeholder="Re-enter new password"
        autoComplete="new-password"
        value={newPassword2}
        onChange={(e) => setNewPassword2(e.target.value)}
      />

      {message && (
        <p style={{color: "red"}} role="alert">
          {message}
        </p>
      )}

      <button
        className={styles.button}
        style={{fontSize: "16px"}}
        disabled={loading}
        onClick={changePassword}
      >
        {loading ? "Changing Password..." : "Change Password"}
      </button>

    </div>
  )
}
