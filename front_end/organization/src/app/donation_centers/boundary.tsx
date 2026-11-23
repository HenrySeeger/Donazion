import React from 'react'
import styles from "../page.module.css"

interface DictFormat {
  donationCenters: {
    name: string;
    inventoryCount: number;
    inventoryValue: number;
  }[];
}

function range(stop: number) {
  let result: number[] = [];
  for (let i = 0; i < stop; i++) {
    result.push(i)
  }
  return result
}

export default function DonationCenterPagination(props: {donationCenters: DictFormat}) {
  let donationCenters = props.donationCenters["donationCenters"]
  // donationCenters.push

  const pageLen = 5
  const [pageNum, setPageNum] = React.useState(1)

  function decrementPage(): void {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
    }
  }

  function incrementPage(): void {
    if (pageNum < donationCenters.length / pageLen) {
      setPageNum(pageNum + 1)
    }
  }

  return (
    <div>
      <table style={{fontSize: "20px"}}>
        <thead>
          <tr>
            <th style={{backgroundColor: "#333333"}}>Donation Center Name</th>
            <th style={{backgroundColor: "#333333"}}>Total Items</th>
            <th style={{backgroundColor: "#333333"}}>Total Value</th>
          </tr>
        </thead>
        <tbody style={{whiteSpace: "pre"}}>
          {donationCenters.filter((dc: DictFormat["donationCenters"][0], index: number) => pageLen * (pageNum - 1) <= index && index < pageLen * pageNum).map((dc: DictFormat["donationCenters"][0], index: number) => <tr key={index}>
            <td key={dc.name}>{dc.name}</td>
            <td key={dc.inventoryCount}>{dc.inventoryCount}</td>
            <td key={dc.inventoryValue}>${dc.inventoryValue.toFixed(2)}</td>
            </tr>
          )}
          {pageNum != Math.ceil(donationCenters.length / pageLen) ? "" : range(pageLen - donationCenters.length % pageLen).map((val: number) => <tr key={val}>
            <td key={val + 0.1}> </td> {/* This piece is fills the last page so that it has the same number of rows as all previous ones */}
          </tr>
          )}
        </tbody>
      </table>
      <br/>
      <div className={styles.flex} style={{whiteSpace: "pre", textAlign: "center"}}>
        <button className={`${styles.button} ${styles.pagination_button}`} style={{marginRight: "10px"}} disabled={pageNum == 1} onClick={() => setPageNum(1)}>◀◀ </button>
        <button className={`${styles.button} ${styles.pagination_button}`} style={{marginRight: "10px"}} disabled={pageNum == 1} onClick={decrementPage}>◀ </button>
        Page {pageNum} of {Math.ceil(donationCenters.length / pageLen)}
        <button className={`${styles.button} ${styles.pagination_button}`} style={{marginLeft: "10px"}} disabled={pageNum == Math.ceil(donationCenters.length / pageLen)} onClick={incrementPage}> ▶</button>
        <button className={`${styles.button} ${styles.pagination_button}`} style={{marginLeft: "10px"}} disabled={pageNum == Math.ceil(donationCenters.length / pageLen)} onClick={() => setPageNum(Math.ceil(donationCenters.length / pageLen))}> ▶▶</button>
      </div>
    </div>
  )
}