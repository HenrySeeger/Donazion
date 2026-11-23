import mysql from 'mysql2'

const getDonationCenterInfo = (pool) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT
                      dc.name,
                      dc.address,
                      COUNT(di.IID) AS inventoryCount,
                      COALESCE(SUM(di.value), 0) AS inventoryValue
                   FROM donation_centers dc
                   LEFT JOIN donated_items di
                      ON di.donation_center_name = dc.name
                   WHERE dc.is_active = 1
                   GROUP BY dc.username, dc.name, dc.address
                   ORDER BY dc.name`
    pool.query(query, (error, rows) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows || [])
      }
    })
  })
}

export const handler = async (event) => {
  let result
  let code
  const pool = mysql.createPool({
    host: process.env.RDS_HOST,
    user: process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    decimalNumbers: true
  })

  try {
    result = await getDonationCenterInfo(pool)
    code = 200
  } catch (error) {
    result = { error: error.message }
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result)
  }

  pool.end()
  return response
}