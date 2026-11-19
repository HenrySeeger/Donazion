import mysql from 'mysql2'

var pool = mysql.createPool({
    host: 	process.env.RDS_HOST,
    user: 	process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE
})

export const handler = async (event) => {
  let result
  let code
  
  try {
    
    result = ""
    code = 200 // Can also produce a 400
  } catch (error) {
    result = error // May want to include additional text around the given error message
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result)
  }

  pool.end()
  return response
} 