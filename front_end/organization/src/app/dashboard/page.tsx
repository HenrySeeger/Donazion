'use client'
import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";
import { awsInstance, mockAwsInstance } from '../ASW';

export default function Home() {
  const [dashData, setDashData] = React.useState<{[key: string]: number}>({})
  
  async function openPage(): Promise<{[key: string]: number}> {
    const response = await awsInstance.get("orgShowDashboard");
    return response.data;
  }
  
  React.useEffect(() => {
    async function loadData() {
      setDashData(await openPage())
    }
    loadData()
  }, [])
  
  return (
    <div className={styles.page}>
      <Nav current_page="dashboard"/>

      <h1>Dashboard</h1><br/>
      
        <div className={styles.box} style={{textAlign: "left", width: "90%"}}>
          <h2>Donation Centers Overview</h2>
          <hr className={styles.box_hr}></hr>
          <p>Total Donation Centers: {dashData.numDonationCenters}</p>
          <p>Total Items: {dashData.numItems}</p>
          <p>Average Items per Donation Center: {dashData.avgItemsPerDonationCenter === undefined ? "" : dashData.avgItemsPerDonationCenter.toFixed(1)}</p>
          <p>Total Inventory Value: {dashData.totalInventoryValue === undefined ? "" : "$" + dashData.totalInventoryValue.toFixed(2)}</p>
          <p>Average Inventory Value per Donation Center: {dashData.avgInventoryValuePerDonationCenter === undefined ? "" : "$" + dashData.avgInventoryValuePerDonationCenter.toFixed(2)}</p>
        </div>
        <br/>
        <div className={styles.box} style={{textAlign: "left", width: "90%"}}>
          <h2>Inventory Overview</h2>
          <hr className={styles.box_hr}></hr>
          <p>Total Categories: {dashData.numCategories}</p>
          <p>Total Items: {dashData.numCategoryItems}</p>
          <p>Lowest low Value: {dashData.lowestLow === undefined ? "" : "$" + dashData.lowestLow.toFixed(2)}</p>
          <p>Highest High Value: {dashData.highestHigh === undefined ? "" : "$" + dashData.highestHigh.toFixed(2)}</p>
        </div>
    </div>
  );
}
