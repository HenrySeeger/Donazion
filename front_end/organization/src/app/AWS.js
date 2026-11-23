import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

export const awsInstance = axios.create({
  baseURL: 'https://homeupdrc8.execute-api.us-east-2.amazonaws.com/prod/donazion/'
});

export const mockAwsInstance = new AxiosMockAdapter(awsInstance, { delayResponse: 0 });

mockAwsInstance.restore();   /* Uncomment this line to disable all mock instances */

mockAwsInstance.onGet("/listDonationCenters").reply(200, [
  {
    "name" : "Donation Center #1",
    "inventoryCount" : 1,
    "inventoryValue" : 10
  },
  {
    "name" : "Donation Center #2",
    "inventoryCount" : 2,
    "inventoryValue" : 20
  },
  {
    "name" : "Donation Center #3",
    "inventoryCount" : 3,
    "inventoryValue" : 30
  },
  {
    "name" : "Donation Center #4",
    "inventoryCount" : 4,
    "inventoryValue" : 40
  },
  {
    "name" : "Donation Center #5",
    "inventoryCount" : 5,
    "inventoryValue" : 50
  },
  {
    "name" : "Donation Center #6",
    "inventoryCount" : 6,
    "inventoryValue" : 60
  },
  {
    "name" : "Donation Center #7",
    "inventoryCount" : 7,
    "inventoryValue" : 70
  },
  {
    "name" : "Donation Center #8",
    "inventoryCount" : 8,
    "inventoryValue" : 80
  },
  {
    "name" : "Donation Center #9",
    "inventoryCount" : 9,
    "inventoryValue" : 90
  },
  {
    "name" : "Donation Center #10",
    "inventoryCount" : 10,
    "inventoryValue" : 100
  },
  {
    "name" : "Donation Center #11",
    "inventoryCount" : 11,
    "inventoryValue" : 110
  },
  {
    "name" : "Donation Center #12",
    "inventoryCount" : 12,
    "inventoryValue" : 120
  },
])