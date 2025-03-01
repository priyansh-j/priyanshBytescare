const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const inputString = `
https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/7m5cs9
https://www.meesho.com/nikhil-gupta-blackbook-of-english-vocabulary-2000-words-englishhindi-2024/p/7wnczv


`;

// Split the input string to create an array of product IDs
const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// Define the CSV writer
const csvWriter = createCsvWriter({
  path: 'bb_Data.csv',  // Output CSV file
  append: true,  // Enable append mode
  header: [
    { id: 'title', title: 'Title' },
    { id: 'price', title: 'Price' },
    { id: 'coverImage', title: 'Cover Image' },
    { id: 'fullProductUrl', title: 'Product URL' },
    { id: 'rating', title: 'Rating' },
    { id: 'reviews', title: 'Reviews' }
  ]
});

// Function to scroll the page
const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // Scroll by 100px each time
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Stop scrolling after 5 seconds
        if (totalHeight >= document.body.scrollHeight || performance.now() > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};

const fetchDataWithPuppeteer = async (url) => {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scroll the page for 5 seconds to load more content
    await autoScroll(page);
    await delay(5000);
    console.log("Scrolling complete");

    // Wait for the required elements to be present (adjust the selector if necessary)
    await page.waitForSelector('.products');

    // Get the page content
    const content = await page.content();

    // Use Cheerio to extract the information from the page content
    const $ = cheerio.load(content);

    // Extract data from the page
    const productList = [];
    $('.sc-gswNZR.sc-hLBbgP .sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0').each((index, element) => {
      const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
      const price = $(element).find('h5').text().trim();
      const coverImage = $(element).find('img').attr('src');
      const productUrl = $(element).find('a').attr('href');
      const fullProductUrl = `https://www.meesho.com${productUrl}`;  // Forming full URL
      const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
      const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

      // Push the product details into the productList array
      productList.push({
        title,
        price,
        coverImage,
        fullProductUrl,
        rating,
        reviews
      });
    });

    return productList;

  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const extractData = async () => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const result = await fetchDataWithPuppeteer(url);
    console.log(`Processed URL: ${url}`);
    if (result && result.length > 0) {
      // Save data for each URL after processing
      await csvWriter.writeRecords(result);
      console.log(`Data from ${url} saved to productData.csv`);
    } else {
      console.log(`No data to save for ${url}.`);
    }
  }
};

extractData();

















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//   const inputString = `
// https://www.meesho.com/blackbook-of-english-vocabulary-march-2023-by-nikhil-gupta/p/7docye
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta-paperback-1-may-2024/p/7e0d50

  
//   `;
//   // Split the input string to create an array of product IDs
//   const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// // Define the CSV writer with the header columns
// const csvWriter = createCsvWriter({
//   path: 'productData.csv',  // Output CSV file
//   header: [
//     { id: 'title', title: 'Title' },
//     { id: 'price', title: 'Price' },
//     { id: 'coverImage', title: 'Cover Image' },
//     { id: 'fullProductUrl', title: 'Product URL' },
//     { id: 'rating', title: 'Rating' },
//     { id: 'reviews', title: 'Reviews' }
//   ]
// });

// // Function to scroll the page
// const autoScroll = async (page) => {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100; // Scroll by 100px each time
//       const timer = setInterval(() => {
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         // Stop scrolling after 5 seconds
//         if (totalHeight >= document.body.scrollHeight || performance.now() > 10000) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });
// };

// const fetchDataWithPuppeteer = async (url) => {
//   let browser;
//   try {
//     // Launch Puppeteer
//     browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // Navigate to the URL
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Scroll the page for 5 seconds to load more content
//     await autoScroll(page);
//     console.log("Scrolling complete");

//     // Wait for the required elements to be present (adjust the selector if necessary)
//     await page.waitForSelector('.products');

//     // Get the page content
//     const content = await page.content();

//     // Use Cheerio to extract the information from the page content
//     const $ = cheerio.load(content);

//     // Extract data from the page
//     const productList = [];
//     $('.sc-gswNZR.sc-hLBbgP .sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0').each((index, element) => {
//       const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
//       const price = $(element).find('h5').text().trim();
//       const coverImage = $(element).find('img').attr('src');
//       const productUrl = $(element).find('a').attr('href');
//       const fullProductUrl = `https://www.meesho.com${productUrl}`;  // Forming full URL
//       const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
//       const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

//       // Push the product details into the productList array
//       productList.push({
//         title,
//         price,
//         coverImage,
//         fullProductUrl,
//         rating,
//         reviews
//       });
//     });

//     return productList;

//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };

// const extractData = async () => {
//   const flatResults = [];

//   for (let i = 0; i < urls.length; i++) {
//     const url = urls[i];
//     const result = await fetchDataWithPuppeteer(url);
//     console.log(`Processed URL: ${url}`);
//     if (result) {
//       flatResults.push(...result); // Spread the results into flatResults
//     }
//   }

//   if (flatResults.length > 0) {
//     // Saving data to a CSV file
//     await csvWriter.writeRecords(flatResults);
//     console.log('Data saved to productData.csv');
//   } else {
//     console.log('No data to save.');
//   }
// };

// extractData();




















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const urls = [
//     "https://www.meesho.com/blackbook-of-english-vocabulary-may-2024/p/79d9z5",
//     "https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta-paperback/p/77vf8y",
//     "https://www.meesho.com/nikhil-guptas-blackbook-of-english-vocabulary-may-2024-edition-20000-words-englishhindi-gupta-edutech/p/72uwd6",
//     "https://www.meesho.com/blackbook-of-english-vocabulary/p/776ori",
//     "https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/71d3a4",
//     "https://www.meesho.com/blackbook-of-english-vocabulary/p/6u1aj0",
//     "https://www.meesho.com/blackbook-of-english-vocabulary/p/7alt00",
//     "https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/72aayb",
//     "https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/6w5cw2",
//     "https://www.meesho.com/nikhil-guptas-blackbook-of-english-vocabulary-may-2024-edition-20000-words-englishhindi-gupta-edutech/p/71d2oa",
//     "https://www.meesho.com/blackbook-of-english-vocabulary/p/6u1aj0",
//      "https://www.meesho.com/blackbook-of-general-awareness-2024/p/6lh8bm"];

// // Function to scroll the page
// const autoScroll = async (page) => {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100; // Scroll by 100px each time
//       const timer = setInterval(() => {
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         // Stop scrolling after 5 seconds
//         if (totalHeight >= document.body.scrollHeight || performance.now() > 10000) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });
// };

// const fetchDataWithPuppeteer = async (url) => {
//   let browser;
//   try {
//     // Launch Puppeteer
//     browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // Navigate to the URL
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Scroll the page for 5 seconds to load more content
//     await autoScroll(page);
//     console.log("Scrolling complete");

//     // Wait for the required elements to be present (adjust the selector if necessary)
//     await page.waitForSelector('.products');

//     // Get the page content
//     const content = await page.content();

//     // Use Cheerio to extract the information from the page content
//     const $ = cheerio.load(content);

//     // Extract data from the page
//     const productList = [];
//     //$('.sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0').each((index, element) => {
//     $('.sc-gswNZR.sc-hLBbgP .sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0').each((index, element) => {
//       const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
//       const price = $(element).find('h5').text().trim();
//       const coverImage = $(element).find('img').attr('src');
//       const productUrl = $(element).find('a').attr('href');
//       const fullProductUrl = `https://www.meesho.com${productUrl}`;  // Forming full URL
//       const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
//       const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

//       // Push the product details into the productList array
//       productList.push({
//         title,
//         price,
//         coverImage,
//         fullProductUrl,
//         rating,
//         reviews
//       });
//     });

//     return productList;

//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };

// const extractData = async () => {
//   const flatResults = [];

//   for (let i = 0; i < urls.length; i++) {
//     const url = urls[i];
//     const result = await fetchDataWithPuppeteer(url);
//     console.log(`Processed URL: ${url}`);
//     if (result) {
//       flatResults.push(...result); // Spread the results into flatResults
//     }
//   }

//   if (flatResults.length > 0) {
//     // Saving to a JSON file
//     fs.writeFileSync('productData.json', JSON.stringify(flatResults, null, 2), 'utf-8');
//     console.log('Data saved to productData.json');
//   } else {
//     console.log('No data to save.');
//   }
// };

// extractData();



















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const urls = [
//   "https://www.meesho.com/adhunik-hindi-vyakaran-aur-rachna-by-vasudevnandan/p/6i2elr",
// ];

// // Function to scroll the page
// const autoScroll = async (page) => {
//   await page.evaluate(async () => {
//     await new Promise((resolve, reject) => {
//       let totalHeight = 0;
//       const distance = 100; // Scroll by 100px each time
//       const timer = setInterval(() => {
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         // Stop scrolling after 5 seconds
//         if (totalHeight >= document.body.scrollHeight || performance.now() > 5000) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });
// };

// const fetchDataWithPuppeteer = async (url) => {
//   let browser;
//   try {
//     // Launch Puppeteer
//     browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // Navigate to the URL
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Scroll the page for 5 seconds to load more content
//     await autoScroll(page);
//     console.log("Scrolling complete");

//     // Wait for the required elements to be present (adjust the selector if necessary)
//     await page.waitForSelector('.sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0');

//     // Get the page content
//     const content = await page.content();

//     // Use Cheerio to extract the information from the page content
//     const $ = cheerio.load(content);

//     // Extract data from the page
//     const productList = [];
//     $('.sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0').each((index, element) => {
//       const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
//       const price = $(element).find('h5').text().trim();
//       const coverImage = $(element).find('img').attr('src');
//       const productUrl = $(element).find('a').attr('href');
//       const fullProductUrl = `https://www.meesho.com${productUrl}`;  // Forming full URL
//       const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
//       const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

//       // Push the product details into the productList array
//       productList.push({
//         title,
//         price,
//         coverImage,
//         fullProductUrl,
//         rating,
//         reviews
//       });
//     });

//     return productList;

//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };

// const extractData = async () => {
//   const flatResults = [];

//   for (let i = 0; i < urls.length; i++) {
//     const url = urls[i];
//     const result = await fetchDataWithPuppeteer(url);
//     console.log(`Processed URL: ${url}`);
//     if (result) {
//       flatResults.push(...result); // Spread the results into flatResults
//     }
//   }

//   if (flatResults.length > 0) {
//     // Saving to a JSON file
//     fs.writeFileSync('productData.json', JSON.stringify(flatResults, null, 2), 'utf-8');
//     console.log('Data saved to productData.json');
//   } else {
//     console.log('No data to save.');
//   }
// };

// extractData();








// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const urls = [
//   "https://www.meesho.com/adhunik-hindi-vyakaran-aur-rachna-by-vasudevnandan/p/6i2elr",
// ];

// const fetchDataWithPuppeteer = async (url) => {
//   let browser;
//   try {
//     // Launch Puppeteer
//     browser = await puppeteer.launch({ headless: false }); // Set `headless: false` if you want to see the browser.
//     const page = await browser.newPage();

//     // Navigate to the URL
//     await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the page to load completely

//     // Wait for the required elements to be present (adjust the selector as necessary)
//     await page.waitForSelector('.sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0');

//     // Get the page content
//     const content = await page.content();
    
//     // Use Cheerio to extract the information from the page content
//     const $ = cheerio.load(content);

//     // Extract data from the page
//     const productList = [];
//     $('.sc-dkrFOg.ProductList__GridCol-sc-8lnc8o-0').each((index, element) => {
//       const title = $(element).find('p.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5').text().trim();
//       const price = $(element).find('h5').text().trim();
//       const coverImage = $(element).find('img').attr('src');
//       const productUrl = $(element).find('a').attr('href');
//       const fullProductUrl = `https://www.meesho.com${productUrl}`;  // Forming full URL
//       const rating = $(element).find('.Rating__StyledPill-sc-12htng8-1').text().trim();
//       const reviews = $(element).find('.NewProductCardstyled__RatingCount-sc-6y2tys-22').text().trim();

//       // Push the product details into the productList array
//       productList.push({
//         title,
//         price,
//         coverImage,
//         fullProductUrl,
//         rating,
//         reviews
//       });
//     });

//     return productList;

//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };

// const extractData = async () => {
//   const flatResults = [];

//   for (let i = 0; i < urls.length; i++) {
//     const url = urls[i];
//     const result = await fetchDataWithPuppeteer(url);
//     console.log(`Processed URL: ${url}`);
//     if (result) {
//       flatResults.push(...result); // Spread the results into flatResults
//     }
//   }

//   if (flatResults.length > 0) {
//     // Saving to a JSON file
//     fs.writeFileSync('productData.json', JSON.stringify(flatResults, null, 2), 'utf-8');
//     console.log('Data saved to productData.json');
//   } else {
//     console.log('No data to save.');
//   }
// };

// extractData();
