'use client'
import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";
import CategoriesTable from "./boundary";
import Link from 'next/link';

interface DictFormat {
  id: number;
  items: {
    id: number;
    name: string;
    low: number;
    high: number;
  }[];
}

let test_input: {[key: string] : DictFormat} = {
  "Household Goods" :
    {
      "id" : 1,
      "items" : 
        [
          {
            "id" : 1,
            "name" : "Towel",
            "low" : 4.35,
            "high" : 15.0
          },
          {
            "id" : 2,
            "name" : "Blanket",
            "low" : 3.0,
            "high" : 16.0
          }
        ]
    },
  "Household Goods2" :
    {
      "id" : 1,
      "items" : 
        [
          {
            "id" : 1,
            "name" : "Towel",
            "low" : 4.35,
            "high" : 15.0
          },
          {
            "id" : 2,
            "name" : "Blanket",
            "low" : 3.0,
            "high" : 16.0
          }
        ]
    },
  "Furniture" :
    {
      "id" : 2,
      "items" : 
        [
          {
            "id" : 3,
            "name" : "Chest",
            "low" : 26.0,
            "high" : 99.0
          },
          {
            "id" : 4,
            "name" : "Coffee Table",
            "low" : 16.0,
            "high" : 67.0
          }
        ]
    }
}

export default function Home() {
  return (
    <div className={styles.page}>
      <Nav current_page="item categories"/>
      <Link href="/item_categories" className={styles.button} style={{position: "fixed", top: "60px", right: "10px", zIndex: 0}}>Save Changes</Link>
      <Link href="/item_categories" className={styles.button} style={{position: "fixed", top: "100px", right: "10px", zIndex: 0}}>Cancel</Link>
      <h1 style={{marginTop: 0, marginBottom: "0px"}}>Categories and Items</h1>
      <p style={{marginTop: 0, marginBottom: "30px"}}>(Not Currently Connected to the Back End)</p>
      {true ? <CategoriesTable categoriesAndItemsJSON={test_input}></CategoriesTable> : <br/>}
    </div>
)}