'use client'
import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";
import DonationCenterPagination from "./boundary";
import { awsInstance } from '../AWS';

export default function Home() {
  interface jsonFormat {
    name : string,
    inventoryCount : number
    inventoryValue : number
  }

  const [donationCentersInfo, setDonationCentersInfo] = React.useState<jsonFormat[]>([])
  
  async function openPage(): Promise<jsonFormat[]> {
    const response = await awsInstance.get("listDonationCenters")
    return response.data
  }
  
  React.useEffect(() => {
    async function loadData() {
      setDonationCentersInfo(await openPage())
    }
    loadData()
  }, [])

  return (
    <div className={styles.page}>
      <Nav current_page="donation centers"/>
      <h1 style={{paddingBottom: "30px"}}>Donation Centers</h1>

      <DonationCenterPagination donationCenters={donationCentersInfo}></DonationCenterPagination>
    </div>
)}