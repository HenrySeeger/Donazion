import mysql from 'mysql2'

var pool = mysql.createPool({
    host: 	process.env.RDS_HOST,
    user: 	process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE
})

const basicQueryOutline = (selectQuery) => {
  return new Promise((resolve, reject) => {
    pool.query(selectQuery, (error, rows) => {
      if (error) {
        reject(new Error("Database error: " + error.sqlMessage))
      } else {
        resolve(rows || [])
      }
    })
  }) 
}

const basicAggregationOutline = (selectQuery) => {
  return new Promise((resolve, reject) => {
    pool.query(selectQuery, (error, rows) => {
      if (error) {
        reject(new Error("Database error: " + error.sqlMessage))
      } else {
        resolve(rows[0].total || 0)
      }
    })
  })
}

export const handler = async () => {
  let result
  let code
  
  try {
    const donationCenters = await basicAggregationOutline("SELECT COUNT(*) AS len FROM donation_centers")
    const donated_items = await basicAggregationOutline("SELECT COUNT(*) AS len FROM donated_items")
    const totalInventoryValue = await basicAggregationOutline("SELECT SUM(value) AS total FROM donated_items")

    const categories = await basicAggregationOutline("SELECT COUNT(*) AS len FROM categories")
    const categoryItems = await basicAggregationOutline("SELECT COUNT(*) AS len FROM categoryItems")
    const lowestLow = await basicAggregationOutline("SELECT Min(low_value) AS minimum FROM category_items")
    const highestHigh = await basicAggregationOutline("SELECT Max(high_value) AS maximum FROM category_items")

    result = {
      numDonationCenters: donationCenters.length,
      numItems: donated_items.length,
      avgItemsPerDonationCenter: donationCenters.length == 0 ? 0 : donated_items.length / donationCenters.length,
      totalInventoryValue: totalInventoryValue,
      avgInventoryValuePerDonationCenter: donationCenters.length == 0 ? 0 : totalInventoryValue / donationCenters.length,

      numCategories: categories.length,
      numCategoryItems: categoryItems.length,
      lowestLow: lowestLow,
      highestHigh: highestHigh
    }
    code = 200
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