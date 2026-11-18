'use client'
import React from 'react'
import styles from "./page.module.css";
import Nav from "./page_navigation";

export default function Home() {
  return (
    <div className={styles.page}>
      <Nav current_page="dashboard"/>

      <h1>Dashboard</h1><br/>
      
        <div className={styles.box} style={{textAlign: "left", width: "90%"}}>
          <h2>Donation Centers Overview</h2>
          <hr className={styles.box_hr}></hr>
          <p>Total Donation Centers: 34</p>
          <p>Total Items: 5,928</p>
          <p>Average Items per Donation Center: 174.35</p>
          <p>Total Inventory Value: $212,322.86</p>
          <p>Average Inventory Value per Donation Center: $6,224.79</p>
        </div>
        <br/>
        <div className={styles.box} style={{textAlign: "left", width: "90%"}}>
          <h2>Inventory Overview</h2>
          <hr className={styles.box_hr}></hr>
          <p>Total Categories: 5</p>
          <p>Total Items: 53</p>
          <p>Lowest low Value: $1.25</p>
          <p>Highest High Value: $83.00</p>
        </div>
    </div>
  );
}
