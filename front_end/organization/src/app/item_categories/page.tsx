'use client'
import React from 'react'
import styles from "../page.module.css";
import Nav from "../page_navigation";
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
  return (
    <div className={styles.page}>
      <Nav current_page="item categories"/>
      <Link href="/edit_item_categories" className={styles.button} style={{position: "absolute", top: "60px", right: "10px", zIndex: 0}}>Edit Categories and Items</Link>
      <button className={styles.button} style={{position: "absolute", top: "100px", right: "10px", zIndex: 0}}>Upload Items</button>
      <h1 style={{marginTop: 0, marginBottom: "0px"}}>Categories and Items</h1>
      <p style={{marginTop: 0, marginBottom: "30px"}}>(Not Currently Connected to the Back End)</p>
      <CategoriesTable categoriesJSON={test_input}></CategoriesTable>
    </div>
)}