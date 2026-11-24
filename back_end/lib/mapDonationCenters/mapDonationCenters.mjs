
import { pool } from "./connection.mjs";
import zipcodes from "zipcodes";

// Allows the frontend to access the API.
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
};

// Calculates the distance between two geographic coordinates.
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 3958.8; // Earth's radius in miles

    const toRadians = (degrees) => degrees * Math.PI / 180;

    const latitudeDifference = toRadians(lat2 - lat1);
    const longitudeDifference = toRadians(lon2 - lon1);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(longitudeDifference / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}

// Handles requests to find donation centers using a ZIP code.
export const handler = async (event) => {
    try {
        // Handles both API Gateway request formats.
	let requestData;

	if (typeof event.body === "string") {
    	// Parses a JSON string from a proxy-style request.
    	try {
        	requestData = JSON.parse(event.body);
    	} catch {
        	throw new Error("Invalid JSON format.");
    	}
	} else if (event.body && typeof event.body === "object") {
    	// Handles an already-parsed request body.
    	requestData = event.body;
	} else {
    	// Handles a non-proxy API Gateway integration.
    	requestData = event;
	}

// Makes sure the request contains usable data.
if (!requestData || typeof requestData !== "object") {
    throw new Error("Invalid request data.");
}

        // Makes sure a ZIP code was provided.
        const zipCode = String(requestData.zipCode || "").trim();

        if (!/^\d{5}$/.test(zipCode)) {
            throw new Error("A valid five-digit ZIP code is required.");
        }

        // Looks up the geographic coordinates of the ZIP code.
        const zipLocation = zipcodes.lookup(zipCode);

        if (!zipLocation) {
            throw new Error("ZIP code could not be found.");
        }

        // Retrieves active donation centers that have coordinates.
        const [rows] = await pool.execute(`
            SELECT
                name,
                address,
                latitude,
                longitude
            FROM donation_centers
            WHERE is_active = 1
                AND latitude IS NOT NULL
                AND longitude IS NOT NULL
        `);

        // Calculates each center's distance from the ZIP code.
        const donationCenters = rows.map((center) => {
            const latitude = Number(center.latitude);
            const longitude = Number(center.longitude);

            return {
                name: center.name,
                address: center.address,
                latitude,
                longitude,
                distanceMiles: Number(
                    calculateDistance(
                        zipLocation.latitude,
                        zipLocation.longitude,
                        latitude,
                        longitude
                    ).toFixed(2)
                )
            };
        });

        // Displays the closest donation centers first.
        donationCenters.sort(
            (a, b) => a.distanceMiles - b.distanceMiles
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                zipCode,
                location: {
                    latitude: zipLocation.latitude,
                    longitude: zipLocation.longitude,
                    city: zipLocation.city,
                    state: zipLocation.state
                },
                donationCenters
            })
        };

    } catch (error) {
        console.error("Unable to map donation centers:", error);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                error: error.message || "Unable to retrieve donation centers."
            })
        };
    }
};
