const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Delay function
const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};

// Function to submit form by changing the page number
const goToPage = async (page, pageNumber) => {
    await page.evaluate((pageNumber) => {
        // Update the page number in the form
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
async function scrapeStartpage(keyword, numPages = 3) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
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

        console.log(`Page ${i} Results:`, results);
    }

    await browser.close();
    return searchResults;
}

// Example usage
scrapeStartpage('physics wallah', 3).then(results => {
    console.log(results);
}).catch(error => {
    console.error('Error:', error);
});





























// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// // Delay function
// const delay = (time) => {
//     return new Promise(resolve => setTimeout(resolve, time));
// };

// // Function to submit form by changing the page number
// const goToPage = async (page, pageNumber) => {
//     await page.evaluate((pageNumber) => {
//         // Update the page number in the form
//         const form = document.querySelector('form.css-77yurj');
//         form.querySelector('input[name="page"]').value = pageNumber;
//         form.submit();  // Submit the form to navigate to the specified page
//     }, pageNumber);
// };

// (async () => {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // Navigate to Startpage website
//     await page.goto('https://www.startpage.com/do/search?query=physics+wallah', { waitUntil: 'networkidle2' });
//     await delay(10000);

//     // Click on the search bar
//     // await page.click('input[name="query"]');
//     // await page.type('input[name="query"]', 'physics wallah');
//     // await page.keyboard.press('Enter');
//     // await delay(10000);

//     const searchResults = [];
    
//     // Extract results from page 1
//     for (let i = 1; i <= 3; i++) {
//         if (i > 1) {
//             // Navigate to the next page using form submission
//             await goToPage(page, i);
//             await delay(10000);  // Wait for the new page to load
//         }

//         // Extract page content
//         const content = await page.content();
//         const $ = cheerio.load(content);

//         // Extract title, source URL, and description from each search result
//         $('div.result.css-z73qjy').each((index, element) => {
//             const title = $(element).find('a.result-title').text().trim();
//             const sourceUrl = $(element).find('a.result-title').attr('href');
//             const description = $(element).find('p.description').text().trim();

//             searchResults.push({ title, sourceUrl, description });
//         });

//         // Log results from the current page
//         console.log(`Page ${i} Results:`, searchResults);
//     }

//     // Close the browser
//     await browser.close();
// })();



















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// // Delay function
// const delay = (time) => {
//     return new Promise(resolve => setTimeout(resolve, time));
// };

// (async () => {
//     // Launch browser
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // Navigate to Startpage website
//     await page.goto('https://www.startpage.com/do/search?query=physics+wallah', { waitUntil: 'networkidle2' });
//     await delay(10000);

//     // Click on the search bar
//     // await page.click('input[name="query"]');

//     // // Type 'physics wallah' into the search bar
//     // await page.type('input[name="query"]', 'physics wallah');

//     // // Press 'Enter' key to submit the search form
//     // await page.keyboard.press('Enter');

//     // // Wait for 10 seconds to let the search results load
//     // await delay(10000);

//     // Extract page content
//     const content = await page.content();

//     // Load the content into Cheerio for scraping
//     const $ = cheerio.load(content);

//     // Extract title, source URL, and description from each search result
//     const searchResults = [];
//     $('div.result.css-z73qjy').each((index, element) => {
//         const title = $(element).find('a.result-title').text().trim();
//         const sourceUrl = $(element).find('a.result-title').attr('href');
//         const description = $(element).find('p.description').text().trim();
        
//         searchResults.push({ title, sourceUrl, description });
//     });

//     // Log search results
//     console.log('Search Results:', searchResults);

//     // Close the browser
//     await browser.close();
// })();







// https://www.startpage.com/do/search?sc=J47lFEmJyFAM20&query=physics+wallah&cat=web&qloc=eyJ0eXBlIjogIm5vbmUifQ%3D%3D         10


// https://www.startpage.com/do/search?sc=zoTog9GC8u1h20&query=physics+wallah&cat=web&qloc=eyJ0eXBlIjogIm5vbmUifQ%3D%3D     20