import React from 'react'

export interface DonationCenter {
  name: string
  address: string
}

export interface CatalogItem {
  iid: number
  itemName: string
  categoryName: string
}

export default function SearchResults(props: {
  items: CatalogItem[]
  selectedIID: number | null
  donationCenters: DonationCenter[]
  searchedItemName: string
  errorMessage: string
  hasSearched: boolean
  onSelect: (iid: number | null) => void
  onSearch: () => void
}) {
  const [category, setCategory] = React.useState('')

  const categories = [...new Set(props.items.map((item) => item.categoryName))].sort()
  const itemsInCategory = props.items.filter((item) => item.categoryName === category)

  function chooseCategory(name: string) {
    setCategory(name)
    props.onSelect(null) // the previously chosen item belongs to the old category
  }

  const count = props.donationCenters.length
  const showResults = props.errorMessage === '' && props.hasSearched
  const cell = { border: '1px solid white', padding: '6px 12px', textAlign: 'left' as const }

  return (
    <div>
      <h1>Who wants what you have?</h1>
      <p>Pick an item to find the centers that have it on their wish list.</p>

      <label>
        Category{' '}
        <select value={category} onChange={(e) => chooseCategory(e.target.value)}>
          <option value="">Choose a category</option>
          {categories.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>{' '}

      <label>
        Item{' '}
        <select
          value={props.selectedIID ?? ''}
          disabled={category === ''}
          onChange={(e) => props.onSelect(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="">Choose an item</option>
          {itemsInCategory.map((item) => <option key={item.iid} value={item.iid}>{item.itemName}</option>)}
        </select>
      </label>{' '}

      <button onClick={props.onSearch}>Search</button>

      {props.errorMessage !== '' && <p>{props.errorMessage}</p>}

      {showResults && count === 0 &&
        <p>No centers have &ldquo;{props.searchedItemName}&rdquo; on their wish list.</p>
      }

      {showResults && count > 0 &&
        <div>
          <p>
            <b>{count} {count === 1 ? 'center has' : 'centers have'}</b> &ldquo;{props.searchedItemName}&rdquo; on their wish list
          </p>
          <table style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={cell}>Name</th>
                <th style={cell}>Street Address</th>
              </tr>
            </thead>
            <tbody>
              {props.donationCenters.map((dc) => <tr key={dc.name}>
                <td style={cell}>{dc.name}</td>
                <td style={cell}>{dc.address}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}