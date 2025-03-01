const puppeteer = require('puppeteer-extra');
const cheerio = require('cheerio');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

// Array of keywords to search
const keywords = [
  "Sri Chaitanya infinity learn",
  "Infinity learn"
];

// Utility function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });

  // This function scrapes a single page
  async function scrapePage(page, query) {
    const baseUrl = "https://yandex.com/search?text=" + encodeURIComponent(query) + "&p=1&lr=21470";
    await page.goto(baseUrl + 0, { waitUntil: 'networkidle0' });
    await delay(3000); // Wait for dynamic content

    const content = await page.content();
    const $ = cheerio.load(content);

    const results = [];
    $('li.serp-item').each((index, element) => {
      const title = $(element).find('h2.OrganicTitle-LinkText').text().trim();
      const url = $(element).find('a.OrganicTitle-Link').attr('href');
      const description = $(element).find('span.OrganicTextContentSpan').text().trim();

      results.push({ title, url, description });
    });

    return results;
  }

  // Object to store results for all keywords
  const allResults = {};

  for (let keyword of keywords) {
    let page = await browser.newPage();
    const keywordResults = await scrapePage(page, keyword);
    allResults[keyword] = keywordResults;
    await page.close();
  }

  await browser.close();

  // Write the results to a JSON file
  fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
}

scrape().catch(console.error);











// const puppeteer = require('puppeteer-extra');
// const cheerio = require('cheerio');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const fs = require('fs');

// puppeteer.use(StealthPlugin());

// // Array of keywords to search
// const keywords = [
  
  
// "Sri Chaitanya infinity learn",
// "Infinity learn"


// ];

// async function scrape() {
//   const browser = await puppeteer.launch({ headless: false });

//   // This function scrapes a single page
//   async function scrapePage(page, query) {
//     const baseUrl = "https://yandex.com/search?text=" + encodeURIComponent(query) + "&p=";
//     await page.goto(baseUrl + 0, { waitUntil: 'networkidle0' });
//     await page.waitForTimeout(3000); // Wait for dynamic content

//     const content = await page.content();
//     const $ = cheerio.load(content);

//     const results = [];
//     $('li.serp-item').each((index, element) => {
//       const title = $(element).find('h2.OrganicTitle-LinkText').text().trim();
//       const url = $(element).find('a.OrganicTitle-Link').attr('href');
//       const description = $(element).find('span.OrganicTextContentSpan').text().trim();

//       results.push({ title, url, description });
//     });

//     return results;
//   }

//   // Object to store results for all keywords
//   const allResults = {};

//   for (let keyword of keywords) {
//     let page = await browser.newPage();
//     const keywordResults = await scrapePage(page, keyword);
//     allResults[keyword] = keywordResults;
//     await page.close();
//   }

//   await browser.close();

//   // Write the results to a JSON file
//   fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
// }

// scrape().catch(console.error);
