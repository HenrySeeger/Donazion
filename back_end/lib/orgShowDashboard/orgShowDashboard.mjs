import { pool } from "./connection.mjs";
import { verifyToken, setJwtSecret } from "./tokens.mjs";
import { getSecret } from "./secrets.mjs";

// Runs a query and returns its numerical result.
const getTotal = async (query) => {
    const [rows] = await pool.execute(query);
    return Number(rows[0]?.total ?? 0);
};

// Creates a response for the frontend.
const respond = (statusCode, data) => ({
    statusCode,
    body: JSON.stringify(data)
});

// Handles Organization dashboard requests.
export const handler = async (event) => {

    // Retrieves the Authorization header.
    const authorization = Object.entries(event?.headers || {})
        .find(([key]) => key.toLowerCase() === "authorization")?.[1];

    // Requires a Bearer token.
    if (typeof authorization !== "string" ||
        !authorization.startsWith("Bearer ")) {
        return respond(401, {
            message: "Authentication required."
        });
    }

    // Verifies the Organization token.
    let decodedToken;

    try {
        const jwtSecret = await getSecret("/donazion/prod/JWT_SECRET");
        setJwtSecret(jwtSecret);
        decodedToken = verifyToken(authorization.slice(7));
    } catch {
        return respond(401, {
            message: "Invalid or expired token."
        });
    }

    try {

        // Checks that the Organization and token are still valid.
        const [organizations] = await pool.execute(
            "SELECT token_version FROM organizations WHERE org_id = ?",
            [decodedToken.orgID]
        );

        if (
            organizations.length === 0 ||
            organizations[0].token_version !== decodedToken.tokenVersion
        ) {
            return respond(401, {
                message: "Authentication token is no longer valid."
            });
        }

        // Retrieves the dashboard statistics.
        const donationCenters = await getTotal(
            "SELECT COUNT(*) AS total FROM donation_centers"
        );

        const donatedItems = await getTotal(
            "SELECT COUNT(*) AS total FROM donated_items"
        );

        const totalInventoryValue = await getTotal(
            "SELECT SUM(value) AS total FROM donated_items"
        );

        const categories = await getTotal(
            "SELECT COUNT(*) AS total FROM categories"
        );

        const categoryItems = await getTotal(
            "SELECT COUNT(*) AS total FROM category_items"
        );

        const lowestLow = await getTotal(
            "SELECT MIN(low_value) AS total FROM category_items"
        );

        const highestHigh = await getTotal(
            "SELECT MAX(high_value) AS total FROM category_items"
        );

        // Calculates averages without dividing by zero.
        const avgItemsPerDonationCenter =
            donationCenters === 0 ? 0 : donatedItems / donationCenters;

        const avgInventoryValuePerDonationCenter =
            donationCenters === 0 ? 0 : totalInventoryValue / donationCenters;

        // Returns all nine dashboard statistics.
        return respond(200, {
            numDonationCenters: donationCenters,
            numItems: donatedItems,
            avgItemsPerDonationCenter,
            totalInventoryValue,
            avgInventoryValuePerDonationCenter,
            numCategories: categories,
            numCategoryItems: categoryItems,
            lowestLow,
            highestHigh
        });

    } catch (error) {
        console.error("Failed to retrieve dashboard:", error);

        return respond(500, {
            message: "Unable to retrieve dashboard statistics."
        });
    }
};
