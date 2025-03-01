import * as cheerio from 'cheerio';
import logger from "../../infra/logging/index.js";  // Import your logger

// Function to extract search results from Brave search results page
function extractBraveResults(body) {
    const $ = cheerio.load(body);
    const results = [];

    // Loop through each search result block
    $('div.snippet.svelte-qm0fz7').each((index, element) => {
        const title = $(element).find('div.title.svelte-1i8038p').text().trim();
        const description = $(element).find('div.snippet-description.desktop-default-regular').text().trim();
        const source = $(element).find('a').attr('href');

        if (title && description) {
            results.push({
                title: title,
                source: source,
                description: description
            });
        }
    });

    return results;
}

// Function to get page content using Puppeteer
async function getPageContent(url, page) {
    logger.info(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'load' });
    return await page.content(); // Get the HTML content of the page
}

// Function to scrape Brave search results
export async function braveSearch(keyword, page) {
    const numPages = 3;
    logger.info(`Starting Brave search for keyword: "${keyword}"`);

    let results = [];
    const baseUrl = `https://search.brave.com/search?q=${encodeURIComponent(keyword)}&offset=`;

    // Loop through the number of pages specified
    for (let i = 0; i < numPages; i++) {
        const url = `${baseUrl}${i}`;
        logger.info(`Fetching results from page ${i + 1}`);

        // Get page content
        const pageContent = await getPageContent(url, page);

        // Extract results from the page content
        const pageResults = extractBraveResults(pageContent);
        results = results.concat(pageResults);
    }

    logger.info(`Brave search for keyword "${keyword}" completed. Extracted ${results.length} results.`);
    return results;
}


