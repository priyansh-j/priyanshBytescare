




const puppeteer = require('puppeteer-extra');
const cheerio = require('cheerio');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs'); // Add this line to require the fs module

puppeteer.use(StealthPlugin());

async function scrape() {
  const browser = await puppeteer.launch({ headless: false,args: ['--no-sandbox', '--disable-setuid-sandbox']  }); // Consider headless: true for production
  const baseQuery = "physics wallah"; // Centralize the query string
  const baseUrl = "https://yandex.com/search?text=" + encodeURIComponent(baseQuery) + "&p=1";

  // Function to handle scraping of each page
  async function scrapePage(pageNumber, page) {
    await page.goto(baseUrl + pageNumber, {  waitUntil: 'networkidle0', timeout: 60000  });
    await page.waitForTimeout(3000); // Wait for dynamic content

    // Get the HTML content of the results page
    const content = await page.content();
    const $ = cheerio.load(content);

    console.log(`Data from page ${pageNumber + 1}:`);
    // Extract the required information using the specified selectors
    const results = [];
    $('li.serp-item').each((index, element) => {
      const title = $(element).find('h2.OrganicTitle-LinkText').text().trim();
      const url = $(element).find('a.OrganicTitle-Link').attr('href');
      const description = $(element).find('span.OrganicTextContentSpan').text().trim();

      results.push({ title, url, description });
    });

    return results;
  }

  // Initial page search
  let initialPage = await browser.newPage();
  await initialPage.goto("https://yandex.com");
  await initialPage.waitForTimeout(3000);
  const searchInputSelector = 'input.search3__input';
  await initialPage.waitForSelector(searchInputSelector);
  await initialPage.click(searchInputSelector);
  await initialPage.type(searchInputSelector, baseQuery);
  await initialPage.keyboard.press('Enter');
  await initialPage.waitForNavigation({ waitUntil: 'networkidle0' });
  const initialResults = await scrapePage(0, initialPage); // Scrape the first result page

  // Open new tabs for the next pages
  const allResults = [...initialResults];
  for (let i = 1; i < 4; i++) {
    const newPage = await browser.newPage();
    const pageResults = await scrapePage(i, newPage); // Scrape each subsequent page
    allResults.push(...pageResults);
    await newPage.close(); // Optionally close each tab after processing
  }

  await initialPage.close(); // Close the initial page
  await browser.close(); // Close the browser

  // Write the results to a JSON file
  fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
}

scrape().catch(console.error);