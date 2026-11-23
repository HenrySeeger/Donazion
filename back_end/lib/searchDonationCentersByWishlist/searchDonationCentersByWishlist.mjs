import mysql from 'mysql2'

const QUERY = `
  SELECT DISTINCT dc.name, dc.address
  FROM wishlist w
  JOIN donation_centers dc ON dc.name = w.donation_center_name
  WHERE w.IID = ? AND dc.is_active = 1
  ORDER BY dc.name`

const queryByWishlist = (pool, wishListItemID) => {
  return new Promise((resolve, reject) => {
    pool.query(QUERY, [wishListItemID], (error, rows) => {
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
    host: 	process.env.RDS_HOST,
    user: 	process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE
  })

  try {
    const wishListItemID = Number(event.iid)
    if (!Number.isInteger(wishListItemID)) {
      throw new Error('A numeric item id (iid) is required.')
    }
    const donationCenters = await queryByWishlist(pool, wishListItemID)
    result = { donationCenters: donationCenters }
    code = 200 // Can also produce a 400
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