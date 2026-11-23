'use client'
import React from 'react'
import SearchResults, { DonationCenter, CatalogItem } from "./boundary";
import { awsInstance } from '../AWS';

export default function Home() {
    const [donationCenters, setDonationCenters] = React.useState<DonationCenter[]>([])
    const [selectedIID, setSelectedIID] = React.useState<number | null>(null)
    const [errorMessage, setErrorMessage] = React.useState('')
    const [hasSearched, setHasSearched] = React.useState(false)
    const [searchedItemName, setSearchedItemName] = React.useState('')
    const [items, setItems] = React.useState<CatalogItem[]>([])

    React.useEffect(() => {
    async function loadItems() {
            try {
                const response = await awsInstance.post('/listCategoryItems', {})
                const payload = JSON.parse(response.data.body)
                if (response.data.statusCode === 200) {
                    setItems(payload.items)
                } else {
                    setErrorMessage(payload.error)
                }
            } catch {
                setErrorMessage('Could not load the item list. Please try again.')
            }
        }
        loadItems()
    }, [])

    async function searchByItem() {
        if (selectedIID === null) {
            setDonationCenters([])
            setErrorMessage('Choose an item to search for.')
            setHasSearched(false)
            return
        }

        try {
            const response = await awsInstance.post('/searchDonationCentersByWishlist', { iid: selectedIID })
            const payload = JSON.parse(response.data.body)
            if (response.data.statusCode === 200) {
                setDonationCenters(payload.donationCenters)
                setErrorMessage('')
            } else {
                setDonationCenters([])
                setErrorMessage(payload.error)
            }
        } catch (error) {
            setDonationCenters([])
            setErrorMessage('Could not reach the server. Please try again.')
        }
        setSearchedItemName(items.find((item) => item.iid === selectedIID)?.itemName ?? '')
        setHasSearched(true)
    }

    return (
        <SearchResults
            items={items}
            selectedIID={selectedIID}
            searchedItemName={searchedItemName}
            donationCenters={donationCenters}
            errorMessage={errorMessage}
            hasSearched={hasSearched}
            onSelect={setSelectedIID}
            onSearch={searchByItem}
        />
    )
}