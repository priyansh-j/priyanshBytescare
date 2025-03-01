const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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
            console.log(`Clicked 'Show more' button ${i + 1} time(s)`);

            // Scroll down to trigger more content loading
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));

            // Wait for the content to load (adjust if necessary)
            await delay(3000); // 3-second delay between scrolls
        } catch (error) {
            console.error('Error while clicking the button or scrolling:', error);
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

// Function to get page content using Puppeteer
async function getPageContent(url, page) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(5000); // Delay to ensure page is loaded
    return await page.content(); // Get the HTML content of the page
}

// Function to scrape Yep search results
async function scrapeYep(keyword, numScrolls = 3) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = `https://yep.com/web?q=${encodeURIComponent(keyword)}`;

    // Get page content and scroll
    await getPageContent(url, page);
    await scrollAndClick(page, numScrolls);
    const content = await page.content();

    // Extract search results from the page content
    const results = extractYepResults(content);

    await browser.close();
    return results;
}

// Example usage
scrapeYep('physics wallah', 3).then(results => {
    console.log(results);
}).catch(error => {
    console.error('Error:', error);
});














// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');


// const delay = (time) => {
//     return new Promise(function(resolve) { 
//         setTimeout(resolve, time);
//     });
// };


// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   const url = 'https://yep.com/web?q=physics%20wallah';
//   await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
//   await delay(5000);

//   async function scrollAndClick(page, times) {
//     for (let i = 0; i < times; i++) {
//       try {
//         // Wait for the button to be visible
//         await page.waitForSelector('.css-120qger-button button', { visible: true });
        
//         // Click the 'Show more' button
//         await page.click('.css-120qger-button button');
        
//         console.log(`Clicked 'Show more' button ${i + 1} time(s)`);

//         // Scroll down to trigger more content loading
//         await page.evaluate(() => window.scrollBy(0, window.innerHeight));

//         // Wait for the content to load (adjust if necessary)
//         await delay(3000); // 3-second delay between scrolls
//       } catch (error) {
//         console.error('Error while clicking the button or scrolling:', error);
//       }
//     }
//   }

//   // Call the scrollAndClick function to click the button 3 times
//   await scrollAndClick(page, 3);
//   const content = await page.content();
//   const $ = cheerio.load(content);

//   let results = [];

//   // Selector for the search result cards
//   $('div.css-102xgmn-card').each((index, element) => {
//     const title = $(element).find('h2.css-x4rx15-text').text().trim();
//     const link = $(element).find('a.css-29ut38-noDecoration').attr('href');
//     const description = $(element).find('div.css-1bozosu-snippet').text().trim();

//     // Push only if title and link are present
//     if (title && link) {
//       results.push({
//         title: title,
//         link: link,
//         description: description
//       });
//     }
//   });

//   console.log(results);

//   await browser.close();
// })();
