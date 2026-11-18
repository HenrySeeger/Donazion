'use client'
import React from 'react'
import styles from "./page.module.css";
import Nav from "./page_navigation";
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.page}>
        <Link href="/dashboard" style={{backgroundColor: "var(--nav-deselected"}}>Go To Dashboard</Link>
        {/* Clicking on this link takes the user to the dashboard. This can act as the login "button". 
            There is an existing 'button' format in page.module.css if you want to use that.*/}

      <h1>Registration/Login</h1><br/>
        
    </div>
  );
}
