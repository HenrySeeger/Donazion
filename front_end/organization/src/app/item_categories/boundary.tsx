import styles from "../page.module.css"
import { jsonFormat } from "./page";

interface DictFormat {
  id: number;
  items: {
    id: number;
    name: string;
    low: number;
    high: number;
  }[];
}

export default function CategoriesTable(props: {categoriesJSON: jsonFormat[]}) {
  let json: jsonFormat[] = props.categoriesJSON
  // let keys: string[] = Object.keys(json)

  function SingleCategoryTable(props: {categoryJSON: jsonFormat}) {
    return (
      <div>
        <h2>{props.categoryJSON.name}</h2>
        <table>
          <thead>
            <tr>
              <th key={1}>Item Name</th>
              <th key={2}>Low Value</th>
              <th key={3}>High Value</th>
            </tr>
          </thead>
          <tbody>
            {props.categoryJSON.items.map((item: jsonFormat["items"][0]) => <tr key={item.IID}>
              <td key={item.name}>{item.name}</td>
              <td key={item.low}>{item.low}</td>
              <td key={item.high}>{item.high}</td>
            </tr>)}
          </tbody>
        </table>
        <br/>
        <br/>
      </div>
    )
  }

  return (
    <div>
      {json.map((category: jsonFormat) => (<SingleCategoryTable key={category.CID} categoryJSON={category}></SingleCategoryTable>))}
    </div>
  )
}