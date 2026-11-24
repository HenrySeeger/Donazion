
'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import DonorTabs from '../donor_tabs'
import { awsInstance } from '../AWS'
import type { DonationCenter } from './boundary'

// Loads Leaflet only in the browser.
const DonationCenterMap = dynamic(
  () => import('./boundary'),
  { ssr: false }
)

type MapResponse = {
  zipCode: string
  location: {
    latitude: number
    longitude: number
    city: string
    state: string
  }
  donationCenters: DonationCenter[]
}

export default function MapByZipPage() {
  const [zipCode, setZipCode] = React.useState('')
  const [mapData, setMapData] = React.useState<MapResponse | null>(null)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Calls the AWS Lambda to find nearby donation centers.
  async function searchByZipCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')
    setMapData(null)

    if (!/^\d{5}$/.test(zipCode.trim())) {
      setErrorMessage('Please enter a valid five-digit ZIP code.')
      return
    }

    setIsLoading(true)

    try {
      const response = await awsInstance.post('/mapDonationCenters', {
        zipCode: zipCode.trim(),
      })

      const payload = response.data

      // Handles the API Gateway response format.
      const result = typeof payload.body === 'string'
        ? JSON.parse(payload.body)
        : payload.body

      if (payload.statusCode !== 200 || result.error) {
        throw new Error(result.error || 'Unable to find donation centers.')
      }

      setMapData(result)
    } catch (error) {
      console.error('ZIP code search failed:', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not reach the server. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <DonorTabs current="/map_by_zip" />

      <h1>Find Donation Centers Near You</h1>

      <p>
        Enter your ZIP code to find nearby donation centers
        and see their locations on a map.
      </p>

      <form
        onSubmit={searchByZipCode}
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="Enter ZIP code"
          value={zipCode}
          onChange={(event) => setZipCode(event.target.value)}
          style={{
            padding: '10px',
            width: '180px',
            border: '1px solid gray',
            borderRadius: '6px',
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          {isLoading ? 'Searching...' : 'Find Centers'}
        </button>
      </form>

      {errorMessage && (
        <p style={{ color: 'red' }}>{errorMessage}</p>
      )}

      {mapData && (
        <div>
          <h2>
            Results near {mapData.location.city}, {mapData.location.state}
          </h2>

          <p>
            Showing donation centers near ZIP code {mapData.zipCode}.
          </p>

          <DonationCenterMap
            zipCode={mapData.zipCode}
            location={mapData.location}
            donationCenters={mapData.donationCenters}
          />
        </div>
      )}
    </div>
  )
}
