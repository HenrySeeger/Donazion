import mysql from 'mysql2'

const QUERY = `
  SELECT ci.IID AS iid, ci.item_name AS itemName, c.category_name AS categoryName
  FROM category_items ci
  JOIN categories c ON c.CID = ci.CID
  ORDER BY c.category_name, ci.item_name`

const queryItems = (pool) => {
  return new Promise((resolve, reject) => {
    pool.query(QUERY, (error, rows) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows || [])
      }
    })
  })
}

export const handler = async () => {
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
    const items = await queryItems(pool)
    result = { items: items }
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