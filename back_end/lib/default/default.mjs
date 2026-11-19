export const handler = async (event) => {

  let result = 'Default lambda function handler'
  
  const response = {
    statusCode: 200,
    body: JSON.stringify(result),
  }
  
  return response
}
