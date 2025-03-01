// import * as puppeteer from 'puppeteer';
// import * as cheerio from 'cheerio';
// import * as fs from 'fs';

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
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
                description: description.trim()
            });
        }
    });

    return results;
}

// Function to get page content using Puppeteer
async function getPageContent(url, page) {
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the page to fully load
    await delay(2000); // Add a delay to ensure content is loaded
    return await page.content(); // Get the HTML content of the page
}

// Function to perform Yahoo search
async function scrapeYahoo(keyword, numResults = 100) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set a user agent to mimic real browser behavior
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
    
    let results = [];
    let currentPage = 1;

    while (results.length < numResults) {
        const startResult = (currentPage - 1) * 10 + 1;
        const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${startResult}`;
        
        // Get page content
        const pageContent = await getPageContent(searchUrl, page);

        // Extract results from the page content
        const pageResults = extractYahooResults(pageContent, numResults - results.length);
        results = results.concat(pageResults);

        if (pageResults.length === 0) break; // Stop if no more results available
        currentPage++;
    }

    await browser.close();
    return results;
}

// Example usage
scrapeYahoo('physics wallah', 50).then(results => {
    // Write the results to a JSON file
    fs.writeFile('yahooSearchResults.json', JSON.stringify(results, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Results saved to yahooSearchResults.json');
        }
    });
}).catch(error => {
    console.error('Error:', error);
});





// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');


// const delay = (time) => {
//     return new Promise(function(resolve) { 
//         setTimeout(resolve, time);
//     });
// };



// async function scrapeYahoo(keyword, numResults = 100) {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // Set a user agent to mimic real browser behavior
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
    
//     let results = [];
//     let currentPage = 1;

//     while (results.length < numResults) {
//         const startResult = (currentPage - 1) * 10 + 1;
//         const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${startResult}`;
        
//         await page.goto(searchUrl, { waitUntil: 'networkidle2' }); // Ensure the page is fully loaded
//         await delay(2000); // Add a delay for content to load

//         const html = await page.content();
//         const $ = cheerio.load(html);

//         // Selector for each search result block within a list item <li>
//         $('li').each((index, element) => {
//             if (results.length >= numResults) return false;

//             const titleElement = $(element).find('h3.title > a');
//             const descriptionElement = $(element).find('div.compText p');
//             const linkElement = titleElement.attr('href');
//             const title = titleElement.text();
//             const description = descriptionElement.text();

//             if (title && linkElement && description) {
//                 results.push({
//                     title: title.trim(),
//                     link: linkElement.trim(),
//                     description: description.trim()
//                 });
//             }
//         });

//         if ($('li').length === 0) break; // No more results available
//         currentPage++;
//     }

//     await browser.close();
//     return results;
// }

// // Example usage
// scrapeYahoo('physics wallah', 50).then(results => {
//     // Write the results to a JSON file
//     fs.writeFile('yahooSearchResults.json', JSON.stringify(results, null, 2), (err) => {
//         if (err) {
//             console.error('Error writing to file', err);
//         } else {
//             console.log('Results saved to yahooSearchResults.json');
//         }
//     });
// }).catch(error => {
//     console.error('Error:', error);
// });












// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');


// const delay = (time) => {
//     return new Promise(function(resolve) { 
//         setTimeout(resolve, time);
//     });
// };


// async function scrapeYahoo(keyword, numResults = 100) {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     let results = [];
//     let currentPage = 1;

//     while (results.length < numResults) {
//         const startResult = (currentPage - 1) * 10 + 1;
//         const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${startResult}`;
//         await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
//          await delay(5000);
//         // Get the HTML content of the page
//         const html = await page.content();
//         console.log(html);

//         // Use Cheerio to parse the HTML and extract data
//         const $ = cheerio.load(html);

//         // Selector for each search result block
//         $('div.dd.fst.algo.algo-sr.relsrch.Sr').each((index, element) => {
//             if (results.length >= numResults) return false;

//             const titleElement = $(element).find('h3.title > a');
//             const descriptionElement = $(element).find('div.compText p');
//             const linkElement = titleElement.attr('href');
//             const title = titleElement.text();
//             const description = descriptionElement.text();

//             if (title && linkElement && description) {
//                 results.push({
//                     title: title.trim(),
//                     link: linkElement.trim(),
//                     description: description.trim()
//                 });
//             }
//         });

//         if ($('div.dd.fst.algo.algo-sr.relsrch.Sr').length === 0) break; // No more results available
//         currentPage++;
//     }

//     await browser.close();
//     return results;
// }

// // Example usage
// scrapeYahoo('physics wallah', 100).then(results => {
//     // Write the results to a JSON file
//     fs.writeFile('yahooSearchResults.json', JSON.stringify(results, null, 2), (err) => {
//         if (err) {
//             console.error('Error writing to file', err);
//         } else {
//             console.log('Results saved to yahooSearchResults.json');
//         }
//     });
// }).catch(error => {
//     console.error('Error:', error);
// });

















// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// async function scrapeYahoo(keyword, numResults = 100) {
//     let results = [];
//     let currentPage = 1;

//     while (results.length < numResults) {
//         const startResult = (currentPage - 1) * 10 + 1;
//         const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${startResult}`;
        
//         // Fetch the HTML of the page using axios
//         const { data } = await axios.get(searchUrl);
        
//         // Load the HTML into cheerio for parsing
//         const $ = cheerio.load(data);
        
//         // Selector for each search result block
//         $('div.dd.fst.algo.algo-sr.relsrch.Sr').each((index, element) => {
//             if (results.length >= numResults) return false;

//             const titleElement = $(element).find('h3.title > a');
//             const descriptionElement = $(element).find('div.compText p');
//             const linkElement = titleElement.attr('href');
//             const title = titleElement.text();
//             const description = descriptionElement.text();

//             if (title && linkElement && description) {
//                 results.push({
//                     title: title.trim(),
//                     link: linkElement.trim(),
//                     description: description.trim()
//                 });
//             }
//         });

//         if ($('div.dd.fst.algo.algo-sr.relsrch.Sr').length === 0) break; // No more results available
//         currentPage++;
//     }

//     return results;
// }

// // Example usage
// scrapeYahoo('physics wallah', 50).then(results => {
//     // Write the results to a JSON file
//     fs.writeFile('yahooSearchResults.json', JSON.stringify(results, null, 2), (err) => {
//         if (err) {
//             console.error('Error writing to file', err);
//         } else {
//             console.log('Results saved to yahooSearchResults.json');
//         }
//     });
// }).catch(error => {
//     console.error('Error:', error);
// });
