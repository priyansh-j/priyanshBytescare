// const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// // Google Search Engine Configuration
// const engines = {
//   meesho: {
//     searchURL: function (key) {
//       return `https://www.google.com/search?q=site:https://www.meesho.com/ ${key}&num=1000`;
//     },
//     extract: function (body) {
//       const $ = cheerio.load(body);
//       const organic_results = $('#center_col .g');
//       const results = { state: '', results: [] };

//       organic_results.each(function () {
//         const serp_obj = {
//           source: $(this).find('div.yuRUbf > a').attr('href'),
//           title: $(this).find('div.yuRUbf > a > h3').text(),
//           description: $(this).find('div.VwiC3b').text(),
//         };

//         if (serp_obj.source) {
//           results.results.push(serp_obj);
//         }
//       });

//       results.state = 'NORMAL';
//       return results;
//     },
//   },
// };

// // Function to scroll the page
// const autoScroll = async (page) => {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         window.scrollBy(0, distance);
//         totalHeight += distance;
//         if (totalHeight >= document.body.scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });
// };

// // Puppeteer-based Data Extraction
// const fetchDataWithPuppeteer = async (page, url) => {
//   try {
//     await page.goto(url, { waitUntil: 'networkidle2' });
//     await autoScroll(page);
//     const content = await page.content();
//     const $ = cheerio.load(content);
//     const productList = [];
//     $('.ProductList__GridCol-sc-8lnc8o-0').each((_, element) => {
//       const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
//       const price = $(element).find('h5').text().trim();
//       const coverImage = $(element).find('img').attr('src');
//       const productUrl = $(element).find('a').attr('href');
//       const fullProductUrl = `https://www.meesho.com${productUrl}`;
//       const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
//       const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

//       productList.push({ title, price, coverImage, fullProductUrl, rating, reviews });
//     });
//     return productList;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return [];
//   }
// };

// // CSV Writers for Search Links and Product Data
// const searchLinksCsvWriter = createCsvWriter({
//   path: 'searchLinks_meesho.csv',
//   header: [
//     { id: 'keyword', title: 'Keyword' },
//     { id: 'title', title: 'Title' },
//     { id: 'source', title: 'Source Link' },
//     { id: 'description', title: 'Description' },
//   ],
// });

// const productDetailsCsvWriter = createCsvWriter({
//   path: 'searchResults_meesho.csv',
//   header: [
//     { id: 'title', title: 'Title' },
//     { id: 'price', title: 'Price' },
//     { id: 'coverImage', title: 'Cover Image' },
//     { id: 'fullProductUrl', title: 'Product URL' },
//     { id: 'rating', title: 'Rating' },
//     { id: 'reviews', title: 'Reviews' },
//   ],
// });

// // Perform Google Search and Extract Related Links
// const performSearches = async (keywords) => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   const searchLinks = [];
//   const allProductDetails = [];

//   try {
//     for (const keyword of keywords) {
//       const searchUrl = engines.meesho.searchURL(keyword);
//       console.log(`Searching for: ${keyword}`);
//       await page.goto(searchUrl, { waitUntil: 'networkidle2' });
//       const pageContent = await page.content();
//       const results = engines.meesho.extract(pageContent);

//       for (const result of results.results) {
//         searchLinks.push({ keyword, ...result });
//         console.log(`Fetching details for: ${result.source}`);
//         const productData = await fetchDataWithPuppeteer(page, result.source);
//         allProductDetails.push(...productData);
//       }
//     }
//   } catch (error) {
//     console.error('Error during search:', error);
//   } finally {
//     await browser.close();
//   }

//   // Write search links and product details to CSV files
//   if (searchLinks.length > 0) {
//     await searchLinksCsvWriter.writeRecords(searchLinks);
//     console.log('Search links saved to searchLinks_meesho.csv');
//   }

//   if (allProductDetails.length > 0) {
//     await productDetailsCsvWriter.writeRecords(allProductDetails);
//     console.log('Product details saved to searchResults_meesho.csv');
//   }
// };

// // Keywords to Search
// const searchKeywords = ["oswaal books"];

// // Start the Search Process
// performSearches(searchKeywords);


////////////

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Google Search Engine Configuration
const engines = {
  meesho: {
    searchURL: function (key) {
      return `https://www.google.com/search?q=site:https://www.meesho.com/ ${key}&num=1000`;
    },
    extract: function (body) {
      const $ = cheerio.load(body);
      const organic_results = $('div.tF2Cxc'); // Updated selector for Google results
      const results = [];

      organic_results.each(function () {
        const title = $(this).find('h3').text().trim();
        const source = $(this).find('a').attr('href');
        const description = $(this).find('.VwiC3b').text().trim();

        if (source) {
          results.push({ title, source, description });
        }
      });

      return results;
    },
  },
};

// CSV Writers for Search Links and Product Data
const searchLinksCsvWriter = createCsvWriter({
  path: 'searchLinks_meesho.csv',
  header: [
    { id: 'keyword', title: 'Keyword' },
    { id: 'title', title: 'Title' },
    { id: 'source', title: 'Source Link' },
    { id: 'description', title: 'Description' },
  ],
});

const productDetailsCsvWriter = createCsvWriter({
  path: 'searchResults_meesho.csv',
  header: [
    { id: 'title', title: 'Title' },
    { id: 'price', title: 'Price' },
    { id: 'coverImage', title: 'Cover Image' },
    { id: 'fullProductUrl', title: 'Product URL' },
    { id: 'rating', title: 'Rating' },
    { id: 'reviews', title: 'Reviews' },
  ],
});

// Function to scroll the page
const autoScroll = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  };


// Puppeteer-based Data Extraction
const fetchDataWithPuppeteer = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await autoScroll(page);
    const content = await page.content();
    const $ = cheerio.load(content);
    const productList = [];
    $('.ProductList__GridCol-sc-8lnc8o-0').each((_, element) => {
      const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
      const price = $(element).find('h5').text().trim();
      const coverImage = $(element).find('img').attr('src');
      const productUrl = $(element).find('a').attr('href');
      const fullProductUrl = `https://www.meesho.com${productUrl}`;
      const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
      const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

      productList.push({ title, price, coverImage, fullProductUrl, rating, reviews });
    });
    return productList;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return [];
  }
};

// Perform Google Search and Extract Related Links
const performSearches = async (keywords) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const searchLinks = [];
  const allProductDetails = [];

  try {
    for (const keyword of keywords) {
      const searchUrl = engines.meesho.searchURL(keyword);
      console.log(`Searching for: ${keyword}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const pageContent = await page.content();
      const results = engines.meesho.extract(pageContent);

      if (results.length === 0) {
        console.warn(`No results found for keyword: ${keyword}`);
        continue;
      }

      for (const result of results) {
        searchLinks.push({ keyword, ...result });
        console.log(`Fetching details for: ${result.source}`);
        const productData = await fetchDataWithPuppeteer(page, result.source);
        allProductDetails.push(...productData);
      }
    }
  } catch (error) {
    console.error('Error during search:', error);
  } finally {
    await browser.close();
  }

  // Write search links and product details to CSV files
  if (searchLinks.length > 0) {
    await searchLinksCsvWriter.writeRecords(searchLinks);
    console.log('Search links saved to searchLinks_meesho.csv');
  }

  if (allProductDetails.length > 0) {
    await productDetailsCsvWriter.writeRecords(allProductDetails);
    console.log('Product details saved to searchResults_meesho.csv');
  }
};

// Keywords to Search
const searchKeywords = ["oswaal books"];

// Start the Search Process
performSearches(searchKeywords);