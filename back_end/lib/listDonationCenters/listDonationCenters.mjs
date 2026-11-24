import { pool } from './connection.mjs'

export const handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,GET,OPTIONS"
    }

    try {
        // Retrieve each donation center and its inventory totals
        const [rows] = await pool.execute(`
            SELECT dc.name, dc.address,
                COUNT(di.IID) AS inventoryCount,
                COALESCE(SUM(di.value), 0) AS inventoryValue
            FROM donation_centers dc
            LEFT JOIN donated_items di
                ON dc.name = di.donation_center_name
            WHERE dc.is_active = 1
            GROUP BY dc.username, dc.name, dc.address
            ORDER BY dc.name
        `)

        const centers = rows.map(row => ({
            name: row.name,
            address: row.address,
            inventoryCount: Number(row.inventoryCount),
            inventoryValue: Number(row.inventoryValue)
        }))

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(centers)
        }
    } catch (error) {
        console.error("Unable to retrieve donation centers:", error)

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: "Unable to retrieve donation centers."
            })
        }
    }
}
