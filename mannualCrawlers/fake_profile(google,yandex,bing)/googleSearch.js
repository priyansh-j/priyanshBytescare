const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs'); // Import the file system module

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to initialize the browser and return the page
async function initializeBrowser() {
    const browser = await puppeteer.launch({ headless: false }); // Set to false for debugging
    const page = await browser.newPage();
    return { browser, page };
}

// Function to scrape Google search results
async function scrapeGoogleSearch(key) {
    const { browser, page } = await initializeBrowser();
    
    // Navigate to the Google search results page
    const url = `https://www.google.com/search?q=${encodeURIComponent(key)}&num=100&tbm=nws`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for 5 seconds
    await delay(5000);

    const results = [];

    // Loop through pagination
    let hasNextPage = true;
    while (hasNextPage) {
        // Get the page content after clicking the button
        const body = await page.content();
        const $ = cheerio.load(body);

        // Check for CAPTCHA
        const block_text = $('div#infoDiv').text();
        if (block_text.includes('solve the CAPTCHA')) {
            await browser.close();
            return { state: 'CAPTCHA_DETECTED', results: [] };
        }

        // Extract organic results
        const organic_results = $('.SoaBEf'); // Updated selector for news articles

        organic_results.each(function () {
            const row_selector = cheerio.load($(this).html());
            const serp_obj = {
                source: row_selector('a').attr('href'), // Article link as source
                title: row_selector('div.n0jPhd').text(), // Title
                description: row_selector('div.GI74Re').text(), // Description
                publishDate: row_selector('div.OSrXXb span').text(), // Publish date
                updatedDate: row_selector('div.OSrXXb span').text() // Updated date (if present)
            };

            if (serp_obj.source && serp_obj.source !== '') {
                results.push(serp_obj);
            }
        });

        // Check for the "Next" button
        try {
            const nextButton = await page.$('td[aria-level="3"] a#pnnext');
            if (nextButton) {
                await nextButton.click();
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
                await delay(5000); // Wait for the next page to load
            } else {
                hasNextPage = false; // No more pages
            }
        } catch (error) {
            console.error('Error clicking on the Next button:', error);
            hasNextPage = false; // Stop if there's an error
        }
    }

    await browser.close();
    return results;
}

// Function to save results to a JSON file
function saveResultsToFile(results, filename) {
    fs.writeFileSync(filename, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Results saved to ${filename}`);
}

// Example usage
const searchKey = 'case'; // Change this to your desired search query
scrapeGoogleSearch(searchKey)
    .then(results => {
        console.log(results);
        saveResultsToFile(results, 'results.json'); // Save results to results.json
    })
    .catch(err => {
        console.error('Error:', err);
    });




