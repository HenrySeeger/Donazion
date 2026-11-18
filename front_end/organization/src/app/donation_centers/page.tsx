'use client'
import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";
import DonationCenterPagination from "./boundary";

interface DictFormat {
  donationCenters: {
    name: string;
    inventoryCount: number;
    inventoryValue: number;
  }[];
}

let test_input: DictFormat = {
  "donationCenters" : [
    {
      "name" : "Donation Center #1",
      "inventoryCount" : 1,
      "inventoryValue" : 10
    },
    {
      "name" : "Donation Center #2",
      "inventoryCount" : 2,
      "inventoryValue" : 20
    },
    {
      "name" : "Donation Center #3",
      "inventoryCount" : 3,
      "inventoryValue" : 30
    },
    {
      "name" : "Donation Center #4",
      "inventoryCount" : 4,
      "inventoryValue" : 40
    },
    {
      "name" : "Donation Center #5",
      "inventoryCount" : 5,
      "inventoryValue" : 50
    },
    {
      "name" : "Donation Center #6",
      "inventoryCount" : 6,
      "inventoryValue" : 60
    },
    {
      "name" : "Donation Center #7",
      "inventoryCount" : 7,
      "inventoryValue" : 70
    },
    {
      "name" : "Donation Center #8",
      "inventoryCount" : 8,
      "inventoryValue" : 80
    },
    {
      "name" : "Donation Center #9",
      "inventoryCount" : 9,
      "inventoryValue" : 90
    },
    {
      "name" : "Donation Center #10",
      "inventoryCount" : 10,
      "inventoryValue" : 100
    },
    {
      "name" : "Donation Center #11",
      "inventoryCount" : 11,
      "inventoryValue" : 110
    },
    {
      "name" : "Donation Center #12",
      "inventoryCount" : 12,
      "inventoryValue" : 120
    },
  ]
}

export default function Home() {
  return (
    <div className={styles.page}>
      <Nav current_page="donation centers"/>
      <h1 style={{paddingBottom: "30px"}}>Donation Centers</h1>

      <DonationCenterPagination donationCenters={test_input}></DonationCenterPagination>
    </div>
)}