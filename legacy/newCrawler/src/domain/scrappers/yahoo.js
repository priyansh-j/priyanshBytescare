import * as cheerio from 'cheerio';
import logger from "../../infra/logging/index.js";  // Import the logger

// Helper function to delay actions
const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};

// Function to extract search results from the page content
function extractYahooResults(body, numResults) {
    const $ = cheerio.load(body);
    const results = [];

    $('li').each((index, element) => {
        if (results.length >= numResults) return false;

        const titleElement = $(element).find('h3.title > a');
        const descriptionElement = $(element).find('div.compText p');
        const linkElement = titleElement.attr('href');
        const title = titleElement.text();
        const description = descriptionElement.text();

        if (title && linkElement && description) {
            results.push({
                title: title.trim(),
                link: linkElement.trim(),
                description: description.trim(),
            });
        }
    });

    return results;
}

// Function to perform Yahoo search
export async function yahooSearch(keyword, page ) {
    logger.info(`Starting Yahoo search for keyword: "${keyword}"`);
    let numResults = 100;
    let results = [];
    let currentPage = 1;

    try {
        while (results.length < numResults) {
            const startResult = (currentPage - 1) * 10 + 1;
            const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${startResult}`;
            
            logger.info(`Fetching results from page ${currentPage}: ${searchUrl}`);

            // Navigate to the search URL using the provided page object
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });
            await delay(2000); // Add a delay to ensure content is loaded

            // Get page content
            const pageContent = await page.content();

            // Extract results from the page content
            const pageResults = extractYahooResults(pageContent, numResults - results.length);
            results = results.concat(pageResults);

            logger.info(`Extracted ${pageResults.length} results from page ${currentPage}`);

            if (pageResults.length === 0) {
                logger.info("No more results available.");
                break; // Stop if no more results are available
            }
            
            currentPage++;
        }
    } catch (error) {
        logger.error(`Error during Yahoo search: ${error.message}`);
    }

    logger.info(`Yahoo search for keyword "${keyword}" completed. Total results: ${results.length}`);
    return results;
}
