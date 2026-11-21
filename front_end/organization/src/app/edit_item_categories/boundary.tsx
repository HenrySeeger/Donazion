import styles from "../page.module.css"

interface DictFormat {
  id: number;
  items: {
    id: number;
    name: string;
    low: number;
    high: number;
  }[];
}

export default function CategoriesTable(props: {categoriesAndItemsJSON: {[key: string] : DictFormat}}) {
  let json: {[key: string] : DictFormat} = props.categoriesAndItemsJSON
  let keys: string[] = Object.keys(json)

  function SingleCategoryTable(props: {categoryName: string, singleCategoryJSON: DictFormat["items"]}) {
    return (
      <div style={{marginBottom: "0px", paddingBottom: "0px"}}>
        <div style={{display: "flex", flexDirection: "row"}}>
          <h2 style={{marginRight: "20px"}}>{props.categoryName}</h2>
          <button className={`${styles.button} ${styles.temp}`} style={{marginRight: "10px", fontWeight: "bold", height: "22px", width: "22px", borderRadius: "100%", marginTop: "5px"}}>X</button>
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
            {props.singleCategoryJSON.map((item: DictFormat["items"][0]) => <tr key={item.id}>
              <td key={item.name}><input style={{margin: "0px", width: "150px"}} id={"name," + String(item.id)} placeholder={item.name}></input></td>
              <td key={item.low}><input style={{margin: "0px", width: "80px"}} id={"low," + String(item.id)} placeholder={String(item.low)}></input></td>
              <td key={item.high} style={{paddingRight: "0px"}}><input style={{margin: "0px", width: "80px"}} id={"high," + String(item.id)} placeholder={String(item.high)}></input></td>
              <td key={item.id + 0.1} style={{paddingLeft: "0px"}}><button className={`${styles.button} ${styles.temp}`} style={{marginRight: "10px", fontWeight: "bold", height: "22px", width: "22px", borderRadius: "100%"}}>X</button></td>
            </tr>)}
            <tr><td style={{paddingLeft: "0px"}}><button className={`${styles.button} ${styles.temp}`} style={{marginLeft: "5px", fontWeight: "bold"}}>Add Item</button></td></tr>
          </tbody>
        </table>
        <br/>
        <br/>
      </div>
    )
  }

  return (
    <div>
      {keys.map((key: string) => (<SingleCategoryTable key={key} categoryName={key} singleCategoryJSON={json[key]["items"]}></SingleCategoryTable>))}
      <button className={`${styles.button} ${styles.temp}`} style={{fontWeight: "bold", fontSize: "13px", position: "relative", bottom: "25px"}}>Add Category</button>
    </div>
  )
}