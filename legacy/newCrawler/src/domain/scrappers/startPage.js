import * as cheerio from 'cheerio';
import logger from "../../infra/logging/index.js";  // Import your logger

// Delay function
const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};

// Function to submit form by changing the page number
const goToPage = async (page, pageNumber) => {
    await page.evaluate((pageNumber) => {
        const form = document.querySelector('form.css-77yurj');
        form.querySelector('input[name="page"]').value = pageNumber;
        form.submit();  // Submit the form to navigate to the specified page
    }, pageNumber);
};

// Function to extract search results from the page content
function extractStartpageResults(body) {
    const $ = cheerio.load(body);
    const results = [];

    // Extract title, source URL, and description from each search result
    $('div.result.css-z73qjy').each((index, element) => {
        const title = $(element).find('a.result-title').text().trim();
        const sourceUrl = $(element).find('a.result-title').attr('href');
        const description = $(element).find('p.description').text().trim();

        // Push only if title and source URL are present
        if (title && sourceUrl) {
            results.push({
                title: title,
                sourceUrl: sourceUrl,
                description: description
            });
        }
    });

    return results;
}

// Function to scrape Startpage search results
export async function startPageSearch(keyword, page) {
    const numPages =4;
    logger.info(`Starting Startpage search for keyword: "${keyword}"`);

    const url = `https://www.startpage.com/do/search?query=${encodeURIComponent(keyword)}`;

    // Navigate to the Startpage website
    await page.goto(url, { waitUntil: 'networkidle2' });
    await delay(5000); // Delay to ensure the page is fully loaded

    const searchResults = [];

    // Extract results from multiple pages
    for (let i = 1; i <= numPages; i++) {
        if (i > 1) {
            // Navigate to the next page using form submission
            await goToPage(page, i);
            await delay(5000);  // Wait for the new page to load
        }

        // Extract page content
        const content = await page.content();

        // Extract search results from the page content
        const results = extractStartpageResults(content);
        searchResults.push(...results);

        logger.info(`Page ${i} Results extracted: ${results.length}`);
    }

    logger.info(`Startpage search for keyword "${keyword}" completed. Total results: ${searchResults.length}`);
    return searchResults;
}
