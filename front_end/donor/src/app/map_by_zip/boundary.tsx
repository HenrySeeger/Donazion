
'use client'

import React from 'react'
import L from 'leaflet'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

export type DonationCenter = {
  name: string
  address: string
  latitude: number
  longitude: number
  distanceMiles: number
}

type MapProps = {
  zipCode: string
  location: {
    latitude: number
    longitude: number
  }
  donationCenters: DonationCenter[]
}

// Updates the map so all donation centers are visible.
function MapUpdater(props: {
  location: [number, number]
  centers: DonationCenter[]
}) {
  const map = useMap()

  React.useEffect(() => {
    const points: L.LatLngExpression[] = [
      props.location,
      ...props.centers.map(center => [
        center.latitude,
        center.longitude,
      ] as L.LatLngExpression),
    ]

    if (points.length === 1) {
      map.setView(props.location, 12)
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    }
  }, [map, props.location, props.centers])

  return null
}

export default function DonationCenterMap(props: MapProps) {
  const zipPosition: [number, number] = [
    props.location.latitude,
    props.location.longitude,
  ]

  // Creates the marker icon using Leaflet's default images.
  const centerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  return (
    <div>
      <div style={{ height: '500px', width: '100%', marginTop: '20px' }}>
        <MapContainer
          center={zipPosition}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater
            location={zipPosition}
            centers={props.donationCenters}
          />

          {/* Marks the ZIP code location. */}
          <Marker position={zipPosition}>
            <Popup>
              Search location: {props.zipCode}
            </Popup>
          </Marker>

          {/* Marks each donation center. */}
          {props.donationCenters.map((center, index) => (
            <Marker
              key={`${center.name}-${index}`}
              position={[center.latitude, center.longitude]}
              icon={centerIcon}
            >
              <Popup>
                <strong>{center.name}</strong>
                <br />
                {center.address}
                <br />
                {center.distanceMiles} miles away
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <h2>Nearby Donation Centers</h2>

      {props.donationCenters.length === 0 ? (
        <p>No donation centers found near this ZIP code.</p>
      ) : (
        <ol>
          {props.donationCenters.map((center, index) => (
            <li key={`${center.name}-${index}`} style={{ marginBottom: '12px' }}>
              <strong>{center.name}</strong>
              <br />
              {center.address}
              <br />
              {center.distanceMiles} miles away
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
