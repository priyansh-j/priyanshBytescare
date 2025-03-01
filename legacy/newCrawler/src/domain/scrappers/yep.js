import * as cheerio from 'cheerio';
import logger from "../../infra/logging/index.js";  // Import the logger

// Helper function to introduce delay
const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
};

// Function to scroll and click the 'Show more' button multiple times
async function scrollAndClick(page, times) {
    for (let i = 0; i < times; i++) {
        try {
            // Wait for the button to be visible
            await page.waitForSelector('.css-120qger-button button', { visible: true });
            
            // Click the 'Show more' button
            await page.click('.css-120qger-button button');
            logger.info(`Clicked 'Show more' button ${i + 1} time(s)`);

            // Scroll down to trigger more content loading
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));

            // Wait for the content to load
            await delay(3000); // 3-second delay between scrolls
        } catch (error) {
            logger.error('Error while clicking the button or scrolling:', error);
            break; // Exit the loop if there's an error
        }
    }
}

// Function to extract search results from the page content
function extractYepResults(body) {
    const $ = cheerio.load(body);
    const results = [];

    // Selector for the search result cards
    $('div.css-102xgmn-card').each((index, element) => {
        const title = $(element).find('h2.css-x4rx15-text').text().trim();
        const link = $(element).find('a.css-29ut38-noDecoration').attr('href');
        const description = $(element).find('div.css-1bozosu-snippet').text().trim();

        // Push only if title and link are present
        if (title && link) {
            results.push({
                title: title,
                link: link,
                description: description
            });
        }
    });

    return results;
}

// Function to perform Yep search
export async function yepSearch(keyword, page) {
    logger.info(`Starting Yep search for keyword: "${keyword}"`);

    const url = `https://yep.com/web?q=${encodeURIComponent(keyword)}`;

    // Navigate to the search URL using the provided page object
    await page.goto(url, { waitUntil: 'networkidle2' });
    await scrollAndClick(page, 3); // Adjust the number of scrolls as needed
    const content = await page.content();

    // Extract search results from the page content
    const results = extractYepResults(content);

    logger.info(`Yep search for keyword "${keyword}" completed. Extracted ${results.length} results.`);
    
    return results;
}
