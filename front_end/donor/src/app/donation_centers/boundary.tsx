import React from 'react'

export interface DonationCenter {
  name: string
  address: string
}

const PAGE_SIZE = 5

export default function DonationCenterList(props: {
  donationCenters: DonationCenter[]
  errorMessage: string
  hasLoaded: boolean
}) {
  const [pageNum, setPageNum] = React.useState(1)

  const cell = { border: '1px solid gray', padding: '6px 12px', textAlign: 'left' as const }
  const count = props.donationCenters.length
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const first = (pageNum - 1) * PAGE_SIZE
  const visible = props.donationCenters.slice(first, first + PAGE_SIZE)

  return (
    <div>
      <h1>Donation Centers</h1>
      <p>Every center registered with Donazion. Choose to start a box.</p>

      {!props.hasLoaded && <p>Loading donation centers...</p>}
      {props.errorMessage !== '' && <p>{props.errorMessage}</p>}

      {props.hasLoaded && props.errorMessage === '' && count === 0 &&
        <p>No donation centers are registered yet.</p>
      }

      {count > 0 &&
        <div>
          <table style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={cell}>Name</th>
                <th style={cell}>Street Address</th>
                <th style={cell}>Donate Here</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((dc, index) => <tr key={first + index}>
                <td style={cell}>{dc.name}</td>
                <td style={cell}>{dc.address}</td>
                <td style={cell}><button disabled title="Prepare Box is not available yet">Prepare box</button></td>
              </tr>)}
            </tbody>
          </table>

          <p>
            Showing {first + 1}-{first + visible.length} of {count} centers{' '}
            <button disabled={pageNum === 1} onClick={() => setPageNum(pageNum - 1)}>Previous</button>
            {' '}Page {pageNum} of {pageCount}{' '}
            <button disabled={pageNum === pageCount} onClick={() => setPageNum(pageNum + 1)}>Next</button>
          </p>
        </div>
      }
    </div>
  )
}