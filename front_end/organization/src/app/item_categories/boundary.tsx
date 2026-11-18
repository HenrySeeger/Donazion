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
      <div>
        <h2>{props.categoryName}</h2>
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
      {keys.map((key: string) => (<SingleCategoryTable key={key} categoryName={key} singleCategoryJSON={json[key]["items"]}></SingleCategoryTable>))}
    </div>
  )
}