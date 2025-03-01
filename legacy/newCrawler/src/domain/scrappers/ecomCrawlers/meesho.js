import axios from "axios";
import logger from "../../../infra/logging/index.js";

const MAX_PAGES = 10; // Set a reasonable limit to prevent excessive scraping

// async function fetchSellerInfo(source) {
//     try {
//         // Simulate a function to fetch seller information (replace with actual logic if available)
//         return { seller: "Seller Name", sellerRating: "4.5" }; // Mock data
//     } catch (error) {
//         logger.warn(`Failed to fetch seller info for ${source}: ${error.message}`);
//         return null;
//     }
// }

async function fetchAndExtractMeesho(keyword) {
    const results = [];
    const apiUrl = "https://www.meesho.com/api/v1/products/search";

    for (let currentPage = 1; currentPage <= MAX_PAGES; currentPage++) {
        const requestBody = {
            query: keyword,
            type: "text_search",
            page: currentPage,
            offset: 50 * (currentPage - 1),
            limit: 50,
            cursor: null,
            isDevicePhone: false,
        };

        try {
            logger.info(`Fetching page ${currentPage} for keyword '${keyword}' from Meesho.`);
            const response = await axios.post(apiUrl, requestBody);

            if (!response.data.catalogs || response.data.catalogs.length === 0) {
                logger.info(`No more results found on page ${currentPage}, stopping.`);
                break;
            }

            const extractedData = await Promise.all(
                response.data.catalogs.map(async (catalog) => {
                    const slug = catalog.slug;
                    const images =
                        catalog.product_images.length > 0
                            ? catalog.product_images[0].url
                            : null;
                    const minProductPrice = catalog.min_product_price;
                    const isbnMatch = catalog.full_details
                        ? catalog.full_details.match(/ISBN:\s+(\d+)/)
                        : null;
                    const isbn = isbnMatch ? isbnMatch[1] : null;
                    const product_id = catalog.product_id;
                    const source = `https://www.meesho.com/${slug}/p/${product_id}`;

                    // Fetch seller info
                    // const sellerInfo = await fetchSellerInfo(source);
                    // const seller = sellerInfo ? sellerInfo.seller : null;
                    // const sellerRating = sellerInfo ? sellerInfo.sellerRating : null;

                    return {
                        title: slug || null,
                        source: source || null,
                        description: JSON.stringify({
                            ISBN: isbn || null,
                            cover: images || null,
                            price: minProductPrice || null,
                        }),
                    };
                })
            );

            results.push(...extractedData);
        } catch (error) {
            logger.error(`Error fetching page ${currentPage} for keyword '${keyword}': ${error.message}`);
            break;
        }
    }

    return results;
}

export async function meeshoSearch(keyword) {
    try {
        const response = await fetchAndExtractMeesho(keyword);
        return response;
    } catch (error) {
        logger.error(`Error during Meesho search: ${error.message}`);
        throw error;
    }
}
