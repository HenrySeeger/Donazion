import React from "react";
import styles from "../page.module.css"
import { jsonFormat } from "./page";

export default function CategoriesTable(props: {categoriesJSON: jsonFormat[], setCategories:  React.Dispatch<React.SetStateAction<jsonFormat[]>>}) {
  let json: jsonFormat[] = props.categoriesJSON

  function addCategory() {
    props.setCategories(prev => [
      ...prev,
      {
          name: "",
          CID: prev.length > 0 ? Math.max(...prev.map(c => c.CID)) + 1 : 1,
          items: []
      }
    ])
  }

  function removeCategory(CID: number) {
    props.setCategories(prev => 
      prev.filter((category) => category.CID !== CID)
    )
  }

  function addItem(CID: number) {
    let newIID = Math.max(...props.categoriesJSON.map((category) => Math.max(...category.items.map((item) => item.IID))), 0) + 1
    props.setCategories(prev => 
      prev.map((category) => category.CID === CID ? 
        {...category, items: [...category.items,
          {
            IID: newIID,
            name: "",
            low: -1,
            high: -1
          }]
        }
        : category
      )
    )
  }

  function removeItem(CID: number, IID: number) {
    props.setCategories(prev => 
      prev.map((category) => category.CID === CID ? 
        {
          ...category,
          items: category.items.filter((item) => item.IID !== IID)
        }
        : category
      )
    ) 
  }

  function SingleCategoryTable(props: {category: jsonFormat}) {
    let CID = props.category.CID
    let items = props.category.items
    return (
      <div style={{marginBottom: "0px", paddingBottom: "0px"}}>
        <div style={{display: "flex", flexDirection: "row"}}>
          <input style={{marginRight: "20px"}} placeholder={props.category.name}></input>
          <button className={`${styles.button} ${styles.temp}`} onClick={() => removeCategory(CID)} style={{marginRight: "10px", fontWeight: "bold", height: "22px", width: "22px", borderRadius: "100%"}}>X</button>
        </div>
        <table>
          <thead>
            <tr>
              <th key={1}>Item Name</th>
              <th key={2}>Low Value</th>
              <th key={3}>High Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: jsonFormat["items"][0]) => <tr key={item.IID}>
              <td key={item.name + item.IID}><input style={{margin: "0px", width: "150px"}} id={"name," + String(item.IID)} placeholder={item.name}></input></td>
              <td key={item.low + item.IID + 0.1}><input style={{margin: "0px", width: "80px"}} id={"low," + String(item.IID)} placeholder={item.low < 0 ? "" : String(item.low)}></input></td>
              <td key={item.high + item.IID + 0.2} style={{paddingRight: "0px"}}><input style={{margin: "0px", width: "80px"}} id={"high," + String(item.IID)} placeholder={item.high < 0 ? "" : String(item.high)}></input></td>
              <td key={item.IID + 0.3} style={{paddingLeft: "0px"}}><button className={`${styles.button} ${styles.temp}`} onClick={() => removeItem(CID, item.IID)} style={{marginRight: "10px", fontWeight: "bold", height: "22px", width: "22px", borderRadius: "100%"}}>X</button>{item.IID}</td>
            </tr>)}
            <tr><td style={{paddingLeft: "0px"}}><button className={`${styles.button} ${styles.temp}`} onClick={() => addItem(CID)} style={{marginLeft: "5px", fontWeight: "bold"}}>Add Item</button></td></tr>
          </tbody>
        </table>
        <br/>
        <br/>
      </div>
    )
  }

  return (
    <div>
      {json.map((category: jsonFormat) => (<SingleCategoryTable key={category.CID} category={category}></SingleCategoryTable>))}
      <button className={`${styles.button} ${styles.temp}`} style={{fontWeight: "bold", fontSize: "13px", position: "relative", bottom: "25px"}} onClick={addCategory}>Add Category</button>
    </div>
  )
}