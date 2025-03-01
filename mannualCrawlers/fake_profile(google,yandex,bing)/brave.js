const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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
    await page.goto(url, { waitUntil: 'load' });
    return await page.content(); // Get the HTML content of the page
}

// Function to scrape Brave search results
async function scrapeBrave(keyword, numPages = 3) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let results = [];
    const baseUrl = `https://search.brave.com/search?q=${encodeURIComponent(keyword)}&offset=`;

    // Loop through the number of pages specified
    for (let i = 0; i < numPages; i++) {
        const url = `${baseUrl}${i}`;

        // Get page content
        const pageContent = await getPageContent(url, page);

        // Extract results from the page content
        const pageResults = extractBraveResults(pageContent);
        results = results.concat(pageResults);

        console.log(`Page ${i + 1} results fetched.`);
    }

    await browser.close();
    return results;
}

// Example usage
scrapeBrave('physics wallah', 3).then(results => {
    console.log(results);
}).catch(error => {
    console.error('Error:', error);
});











// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   let results = [];
//   const baseUrl = 'https://search.brave.com/search?q=physics%20wallah&offset=';

//   // Loop through 5 pages
//   for (let i = 0; i <= 2; i++) {
//     const offset = i;  // Adjust the offset for each page
//     const url = `${baseUrl}${offset}`;

//     await page.goto(url, { waitUntil: 'load' });
//     const content = await page.content();
//     const $ = cheerio.load(content);

//     // Extracting data
//     $('div.snippet.svelte-qm0fz7').each((index, element) => {
//       const title = $(element).find('div.title.svelte-1i8038p').text().trim();
//       //const source = $(element).find('cite.snippet-url.desktop-small-regular.svelte-ksletb span.netloc').text().trim();
//       const description = $(element).find('div.snippet-description.desktop-default-regular').text().trim();
//       const source = $(element).find('a').attr('href'); 

//       // Push extracted data into results array
//       if (title && description) {
//       results.push({
//         title: title,
//         source: source,
//         description: description
//       });
//     }
//     });

//     console.log(`Page ${i + 1} results fetched.`);
//   }

//   console.log(results);

//   await browser.close();
// })();
