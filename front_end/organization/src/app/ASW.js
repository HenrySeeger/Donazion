import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

export const awsInstance = axios.create({
  baseURL: 'https://homeupdrc8.execute-api.us-east-2.amazonaws.com/prod/donazion'
});

export const mockAwsInstance = new AxiosMockAdapter(awsInstance, { delayResponse: 0 });

mockAwsInstance.restore();   /* Uncomment this line to disable all mock instances */

mockAwsInstance.onGet("/orgShowDashboard").reply(200, {
  numDonationCenters: 24,
  numItems: 5928,
  avgItemsPerDonationCenter: 174.35,
  totalInventoryValue: 212322.86,
  avgInventoryValuePerDonationCenter: 6224.79,
  numCategories: 5,
  numCategoryItems: 53,
  lowestLow: 1.25,
  highestHigh: 83.00
})
