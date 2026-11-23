'use client'
import React from 'react'
import DonationCenterList, { DonationCenter } from "./boundary";
import DonorTabs from '../donor_tabs';
import { awsInstance } from '../AWS';

export default function Home() {
    const [donationCenters, setDonationCenters] = React.useState<DonationCenter[]>([])
    const [errorMessage, setErrorMessage] = React.useState('')
    const [hasLoaded, setHasLoaded] = React.useState(false)

    React.useEffect(() => {
        async function loadDonationCenters() {
            try {
                const response = await awsInstance.post('/listDonationCenters', {})
                const payload = JSON.parse(response.data.body)
                if (response.data.statusCode === 200) {
                    setDonationCenters(payload)
                    setErrorMessage('')
                } else {
                    setErrorMessage(payload.error ?? 'Could not load donation centers.')
                }
            } catch {
                setErrorMessage('Could not reach the server. Please try again.')
            }
            setHasLoaded(true)
        }
        loadDonationCenters()
    }, [])

    return (
        <div>
            <DonorTabs current="/donation_centers" />
            <DonationCenterList
                donationCenters={donationCenters}
                errorMessage={errorMessage}
                hasLoaded={hasLoaded}
            />
        </div>
    )
}