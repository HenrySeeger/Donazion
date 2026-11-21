import mysql from 'mysql2'

var pool = mysql.createPool({
    host: 	process.env.RDS_HOST,
    user: 	process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE
})

const getDonationCenterInfo = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT
                      dc.name,
                      COUNT(di.IID) AS inventoryCount,
                      COALESCE(SUM(di.value), 0) AS inventoryValue
                   FROM donation_centers dc
                   LEFT JOIN donated_items di
                      ON dc.name = di.name
                   GROUP BY dc.name`
    pool.query(query, (error, rows) => {
      if (error) {
        reject(new Error(error))
      } else {
        resolve(rows || [])
      }
    })
  })
}

export const handler = async (event) => {
  let result
  let code
  
  try {
    result = await getDonationCenterInfo()
    code = 200
  } catch (error) {
    result = error
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result)
  }

  pool.end()
  return response
} 