import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

const MAX_PAGES = 10; // Set a reasonable limit to avoid infinite loops

async function fetchAndExtractPaytm(keyword) {
    const results = [];
    let currentPage = 1;

    while (currentPage <= MAX_PAGES) {
        const url = `https://paytmmall.com/shop/search?q=${encodeURIComponent(keyword)}&page=${currentPage}`;
        logger.info(`Fetching URL: ${url}`);

        try {
            const { data: body } = await axios.get(url);
            const $ = cheerio.load(body);

            // Check for CAPTCHA detection
            const blockText = $('div#infoDiv').text();
            if (blockText.includes("solve the CAPTCHA")) {
                logger.warn("CAPTCHA detected, stopping scraping.");
                return { state: "CAPTCHA_DETECTED", results: [] };
            }

            // Process organic results
            const organicResults = $('div._2i1r');
            if (organicResults.length === 0) {
                logger.info(`No data found on page ${currentPage}, stopping.`);
                break; // Stop if no results on the current page
            }

            organicResults.each((index, element) => {
                const rowSelector = cheerio.load($(element).html());

                const item = {
                    title: rowSelector('.UGUy').text().trim(),
                    source: "https://paytmmall.com" + rowSelector('a._8vVO').attr('href'),
                    price: rowSelector('div._1kMS').text().replace('-31%', '').trim(),
                };

                const { title, source, ...otherProperties } = item;

                if (source) {
                    results.push({
                        title,
                        source,
                        description: JSON.stringify(otherProperties),
                    });
                }
            });

            logger.info(`Processed page ${currentPage} for keyword '${keyword}'.`);
            currentPage++; // Move to the next page
        } catch (error) {
            logger.error(`Error fetching page ${currentPage} for keyword '${keyword}': ${error.message}`);
            throw error;
        }
    }

    return results;
}

export async function paytmSearch(keyword) {
    try {
        const response = await fetchAndExtractPaytm(keyword);
        return response;
    } catch (error) {
        logger.error(`Error during Paytm search: ${error.message}`);
        throw error;
    }
}
