
'use client'

import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";
import DonationCenterPagination from "./boundary";
import { awsInstance } from '../AWS';

export default function Home() {

  interface jsonFormat {
    name: string,
    inventoryCount: number,
    inventoryValue: number
  }

  const [donationCentersInfo, setDonationCentersInfo] =
    React.useState<jsonFormat[]>([])

  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  // Retrieves donation centers from the backend.
  async function openPage(): Promise<jsonFormat[]> {

    const response = await awsInstance.post(
      "listDonationCenters",
      {}
    )

    // Checks the backend response status.
    const statusCode =
      response.data.statusCode ?? response.status

    if (statusCode !== 200) {
      throw new Error("Unable to retrieve donation centers.")
    }

    // Parses the API response.
    const result =
      typeof response.data.body === "string"
        ? JSON.parse(response.data.body)
        : response.data

    if (!Array.isArray(result)) {
      throw new Error("Invalid donation center data.")
    }

    return result
  }

  // Loads donation centers when the page opens.
  React.useEffect(() => {

    async function loadData() {
      try {
        setDonationCentersInfo(await openPage())
      } catch {
        setError("Unable to load donation centers.")
      } finally {
        setLoading(false)
      }
    }

    loadData()

  }, [])

  return (
    <div className={styles.page}>

      <Nav current_page="donation centers"/>

      <h1 style={{paddingBottom: "30px"}}>
        Donation Centers
      </h1>

      {loading ? (
        <p>Loading donation centers...</p>
      ) : error ? (
        <p style={{color: "red"}}>{error}</p>
      ) : donationCentersInfo.length === 0 ? (
        <p>No donation centers found.</p>
      ) : (
        <DonationCenterPagination
          donationCenters={donationCentersInfo}
        />
      )}

    </div>
  )
}
