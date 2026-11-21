'use client'
import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";

export default function Home() {
  return (
    <div className={styles.page}>
      <Nav current_page="edit password"/>
      <h1>Edit Password</h1>
      <p style={{marginBottom: "30px"}}>(Not Currently Connected to the Back End)</p>
      <input placeholder={"Enter existing password"}/>
      <input placeholder={"Enter new password"}/>
      <input placeholder={"Re-enter existing password"}/>
      <button className={styles.button} style={{fontSize: "16px"}} disabled={false}>Change Password</button>
    </div>
)}