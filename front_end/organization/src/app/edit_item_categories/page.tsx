'use client'
import React from 'react'
import styles from "../page.module.css";
import CategoriesTable from "./boundary";
import Link from 'next/link';

export interface jsonFormat {
  name: string;
  CID: number;
  items: {
    IID: number;
    name: string;
    low: number;
    high: number;
  }[];
}

let test_input: jsonFormat[] = [
  {
    name : "Household Goods",
    CID : 1,
    items : 
      [
        {
          IID : 1,
          name : "Towel",
          low : 4.35,
          high : 15.0
        },
        {
          IID : 2,
          name : "Blanket",
          low : 3.0,
          high : 16.0
        }
      ]
  },
  {
    name : "Appliances",
    CID : 2,
    items : 
      [
        {
          IID : 3,
          name : "Air Conditioner",
          low : 21,
          high : 93
        },
        {
          IID : 4,
          name : "Gas Stove",
          low : 52,
          high : 130
        }
      ]
  },
  {
    name: "Furniture",
    CID : 3,
    items : 
      [
        {
          IID : 5,
          name : "Chest",
          low : 26.0,
          high : 99.0
        },
        {
          IID : 6,
          name : "Coffee Table",
          low : 16.0,
          high : 67.0
        }
      ]
  }
]

export default function Home() {
  const [categories, setCategories] = React.useState(test_input)

  function timeout(delay: number) {
      return new Promise( res => setTimeout(res, delay) );
  }

  function clickCancel() {
    console.log("Clean up1")
    timeout(100000)
    console.log("Clean up2")
    setCategories(test_input)
  }

  return (
    <div className={styles.page}>
    <div className={styles.nav_container} style={{zIndex: 1}}>
      <div className={styles.disabled_nav_container_a} style={{backgroundColor: "var(--nav-deselected"}}>Dashboard</div>
      <div className={styles.disabled_nav_container_a} style={{backgroundColor: "rgb(from var(--nav-selected) r g b / 0.4)"}}>Categories & Items</div>
      <div className={styles.disabled_nav_container_a} style={{backgroundColor: "var(--nav-deselected"}}>Donation Centers</div>
      <div className={styles.disabled_nav_container_a} style={{backgroundColor: "var(--nav-deselected"}}>Edit Password</div>
    </div>
      <Link href="/item_categories" className={styles.button} style={{position: "fixed", top: "60px", right: "10px", zIndex: 0}}>Save Changes</Link>
      <Link href="/item_categories" className={styles.button} onClick={clickCancel} style={{position: "fixed", top: "100px", right: "10px", zIndex: 0}}>Cancel</Link>
      <h1 style={{marginTop: "20px"}}>Categories and Items</h1>
      <p style={{marginBottom: "30px"}}>(Not Currently Connected to the Back End)</p>
      <CategoriesTable categoriesJSON={categories} setCategories={setCategories}></CategoriesTable>
    </div>
)}