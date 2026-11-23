import React from "react";
import styles from "../page.module.css"
import { jsonFormat, deletionsFormat } from "./page";

interface changesFormat {
  column: string,
  ID: number,
  value: string | number
}

export default function CategoriesTable(props: {categoriesJSON: jsonFormat[], setCategories:  React.Dispatch<React.SetStateAction<jsonFormat[]>>, deletions: deletionsFormat[]}) {
  let json: jsonFormat[] = props.categoriesJSON
  let aL: deletionsFormat[] = []
  const [additionLogs, setAdditionLogs] = React.useState(aL)
  let cL: changesFormat[] = []
  const [changeLogs, setChangeLogs] = React.useState(cL)

  function addCategory() {
    let newCID: number = Math.max(...json.map((category) => category.CID), 0) + 1
    props.setCategories(prev => [
      ...prev,
      {
          name: "",
          CID: newCID,
          items: []
      }
    ])
    setAdditionLogs(prev => [
      ...prev,
      {
          level: "category",
          ID: newCID
      }
    ])
  }

  function removeCategory(CID: number) {
    for (let item of json.filter((category) => category.CID === CID)[0].items) {
      if (additionLogs.filter((log) => log.level === "item" && log.ID === item.IID).length == 0) {
        props.deletions.push({level: "item", ID: item.IID})
      } else {
        setAdditionLogs((prev) => prev.filter((log) => !(log.level === "item" && log.ID === item.IID)))
      }
    }
    props.setCategories(prev => 
      prev.filter((category) => category.CID !== CID)
    )
    if (additionLogs.filter((log) => log.level === "category" && log.ID === CID).length == 0) {
      props.deletions.push({level: "category", ID: CID})
    } else {
      setAdditionLogs((prev) => prev.filter((log) => !(log.level === "category" && log.ID === CID)))
    }
  }

  function addItem(CID: number) {
    let newIID = Math.max(...props.categoriesJSON.map((category) => Math.max(...category.items.map((item) => item.IID))), 0) + 1
    props.setCategories(prev => 
      prev.map((category) => category.CID === CID ? 
        {...category, items: [...category.items,
          {
            IID: newIID,
            name: "",
            low: 0,
            high: 0
          }]
        }
        : category
      )
    )
    setAdditionLogs(prev => [
      ...prev,
      {
          level: "item",
          ID: newIID
      }
    ])
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
    if (additionLogs.filter((log) => log.level === "item" && log.ID === IID).length == 0) {
      props.deletions.push({level: "item", ID: IID})
    } else {
      setAdditionLogs((prev) => prev.filter((log) => !(log.level === "item" && log.ID === IID)))
    }
  }

  
  // const input = document.getElementById("low,1");

  // if (input !== null) {
  //   input.addEventListener("change", InputChange)
  // }

  // function InputChange(event: Event) {
  // const input = event.target as HTMLInputElement;
  
  // function InputChange(event) {
  //   input.textContent = e.target.value;
  // }

  function InputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let eventID: string = event.target.id
    let column: string = eventID.substring(0, eventID.indexOf(","))
    let ID: number = parseFloat(eventID.substring(eventID.indexOf(",") + 1, eventID.length))
    let value: string = event.target.value
    console.log(`${eventID} | ${column} | ${ID} | ${value}`)
    
    let alreadyLogged = false
    for (let i = 0; i < changeLogs.length; i++) {
      if (changeLogs[i].column === column && changeLogs[i].ID === ID) {
        setChangeLogs((prev) => prev.map((change) => 
          change.column === column && change.ID ===ID ?
          {
            column: column,
            ID: ID,
            value: value
          }
          : change
        ))
        alreadyLogged = true
      }
    }
    if (!alreadyLogged) {
      setChangeLogs((prev) => [...prev, {
          column: column,
          ID: ID,
          value: value
        }
      ])
    }

    if (column === "category") {
      props.setCategories((prev) => prev.map((category) =>
        category.CID === ID ?
        {
          name: value,
          CID: ID,
          items: category.items
        }
        : category
      ))
    } else {
      let numberValue: number
      if (column !== "name") {
        numberValue = parseFloat(value)
        if (isNaN(numberValue)) {
          numberValue = 0
        }
      }
      props.setCategories((prev) => prev.map((category) =>
        ({
          name: category.name,
          CID: category.CID,
          items: category.items.map((item) =>
            item.IID === ID ?
            {
              IID: ID,
              name: column === "name" ? value : item.name,
              low: column === "low" ? numberValue : item.low,
              high: column === "high" ? numberValue : item.high
            }
            : item
          )
        })
      ))
    }
  }

  return (
    <div>
      {json.map((category: jsonFormat) => (<SingleCategoryTable key={category.CID} category={category} InputChange={InputChange} removeCategory={removeCategory} addItem={addItem} removeItem={removeItem}></SingleCategoryTable>))}
      <button className={`${styles.button} ${styles.temp}`} style={{fontWeight: "bold", fontSize: "13px", position: "relative", bottom: "25px"}} onClick={addCategory}>Add Category</button>
    </div>
  )
}

function SingleCategoryTable(props: {category: jsonFormat, InputChange: (event: React.ChangeEvent<HTMLInputElement, Element>) => void, removeCategory: (CID: number) => void, addItem: (IID: number) => void, removeItem: (CID: number, IID: number) => void}) {
  let CID = props.category.CID
  let items = props.category.items
  return (
    <div style={{marginBottom: "0px", paddingBottom: "0px"}}>
      <div style={{display: "flex", flexDirection: "row"}}>
        <input style={{marginRight: "20px"}} value={props.category.name} id={"category," + CID} onChange={props.InputChange}></input>
        <button className={`${styles.button} ${styles.temp}`} onClick={() => props.removeCategory(CID)} style={{marginRight: "10px", fontWeight: "bold", height: "22px", width: "22px", borderRadius: "100%"}}>X</button>{CID}
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
            <td key={"name: " + item.IID}><input style={{margin: "0px", width: "150px"}} id={"name," + item.IID} value={item.name} onChange={props.InputChange}></input></td>
            <td key={"low: " + item.IID + 0.1}>$ <input style={{margin: "0px", width: "70px"}} id={"low," + item.IID} value={item.low} onChange={props.InputChange}></input></td>
            <td key={"high: " + item.IID + 0.2} style={{paddingRight: "0px"}}>$ <input style={{margin: "0px", width: "70px"}} id={"high," + item.IID} value={item.high} onChange={props.InputChange}></input></td>
            <td key={"button: " + item.IID} style={{paddingLeft: "0px"}}><button className={`${styles.button} ${styles.temp}`} onClick={() => props.removeItem(CID, item.IID)} style={{marginRight: "10px", fontWeight: "bold", height: "22px", width: "22px", borderRadius: "100%"}}>X</button>{item.IID}</td>
          </tr>)}
          <tr><td style={{paddingLeft: "0px"}}><button className={`${styles.button} ${styles.temp}`} onClick={() => props.addItem(CID)} style={{marginLeft: "5px", fontWeight: "bold"}}>Add Item</button></td></tr>
        </tbody>
      </table>
      <br/>
      <br/>
    </div>
  )
}  