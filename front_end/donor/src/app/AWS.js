import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

export const awsInstance = axios.create({
  baseURL: 'https://homeupdrc8.execute-api.us-east-2.amazonaws.com/prod/donazion'
})

export const mockAwsInstance = new AxiosMockAdapter(awsInstance, { delayResponse: 0 })

// mockAwsInstance.restore()

const centerA = { name: 'TEST Center A', address: '100 Institute Rd, Worcester, MA' }
const centerB = { name: 'TEST Center B', address: '1 Main St, Worcester, MA' }
const centersByItem = { 9001: [centerA], 9002: [centerA, centerB] }

mockAwsInstance.onPost('/searchDonationCentersByWishlist').reply((config) => {
  const { iid } = JSON.parse(config.data)
  if (!Number.isInteger(Number(iid))) {
    return [200, { statusCode: 400, body: JSON.stringify({ error: 'A numeric item id (iid) is required.' }) }]
  }
  return [200, { statusCode: 200, body: JSON.stringify({ donationCenters: centersByItem[iid] ?? [] }) }]
})