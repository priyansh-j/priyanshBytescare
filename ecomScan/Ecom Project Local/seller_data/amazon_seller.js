const axios = require('axios');
const cheerio = require('cheerio');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyAgent = new HttpsProxyAgent("http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000");

const headers = {
    'accept': 'text/html,*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'viewport-width': '682',
    'x-requested-with': 'XMLHttpRequest'
};

const maxRetries = 3;

async function scrapeData(asin) {
    let results = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= 3) {
        const url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`;
        let attempts = 0;
        let success = false;

        while (attempts < maxRetries && !success) {
            try {
                const response = await axios.get(url, {
                    headers,
                    httpAgent: proxyAgent,
                    httpsAgent: proxyAgent
                });

                const content = response.data;
                const $ = cheerio.load(content);

                const price = $('#aod-price-0 .a-price-whole').first().text().trim();
                const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
                const mrpMatch = mrpText.match(/₹\d+.\d+/);
                const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';
                const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();
                const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
                const sellerLink = $('#aod-offer-soldBy a').attr('href');
                const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
                const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;

                let serp_obj1 = {
                    price: price,
                    mrp: mrp,
                    discount: discount,
                    condition: conditionElement,
                    seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
                    sellerID: sellerId,
                    ASIN: asin,
                    SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerId}&psc=1`
                };
                if (serp_obj1.seller) {
                    results.push(serp_obj1);
                }

                let offerList = $('#aod-offer-list .aod-information-block');
                console.log(`ASIN ${asin} - Page ${currentPage}: ${offerList.length} offers found`);

                offerList.each((i, elem) => {
                    let row = cheerio.load($(elem).html());

                    let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
                    let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

                    let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
                    let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

                    let href = row('a.a-size-small.a-link-normal').attr('href');
                    let sellerID = href ? (href.split("seller=")[1] ? href.split("seller=")[1].split("&")[0] : null) : null;

                    let serp_obj = {
                        price: price ? price[0].replace(/,/g, '') : 'Unavailable',
                        mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
                        discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
                        condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
                        seller: row('a.a-size-small.a-link-normal').text().trim(),
                        sellerID: sellerID,
                        ASIN: asin,
                        SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
                    };

                    if (serp_obj.seller) {
                        results.push(serp_obj);
                    }
                });

                if (offerList.length >= 10) {
                    currentPage++;
                } else {
                    hasNextPage = false;
                }
                success = true; // If we reach here, the request was successful
            } catch (error) {
                attempts++;
                console.error(`Error fetching page ${currentPage} for ASIN ${asin}:`, error.response ? error.response.status : error.message);
                if (attempts >= maxRetries) {
                    hasNextPage = false; // Stop further attempts after max retries
                }
            }
        }
    }
    return results;
}

module.exports = { scrapeData };

















// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const { HttpsProxyAgent } = require('https-proxy-agent');
// const path = require('path');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const app = express();
// const port = 3000;

// const proxyAgent = new HttpsProxyAgent("http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000");

// const headers = {
//     'accept': 'text/html,*/*',
//     'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
//     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
//     'viewport-width': '682',
//     'x-requested-with': 'XMLHttpRequest'
// };

// const maxRetries = 3;

// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.post('/scrape', async (req, res) => {
//     let asins = req.body.asins;
//     let results = [];

//     const csvWriter = createCsvWriter({
//         path: 'results.csv',
//         header: [
//             { id: 'price', title: 'Price' },
//             { id: 'mrp', title: 'MRP' },
//             { id: 'discount', title: 'Discount' },
//             { id: 'condition', title: 'Condition' },
//             { id: 'seller', title: 'Seller' },
//             { id: 'sellerID', title: 'SellerID' },
//             { id: 'ASIN', title: 'ASIN' },
//             { id: 'SellerListingLink', title: 'SellerListingLink' }
//         ]
//     });

//     async function scrapeData(asin) {
//         let currentPage = 1;
//         let hasNextPage = true;

//         while (hasNextPage && currentPage <= 3) {
//             const url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`;
//             let attempts = 0;
//             let success = false;

//             while (attempts < maxRetries && !success) {
//                 try {
//                     const response = await axios.get(url, {
//                         headers,
//                         httpAgent: proxyAgent,
//                         httpsAgent: proxyAgent
//                     });

//                     const content = response.data;
//                     const $ = cheerio.load(content);

//                     const price = $('#aod-price-0 .a-price-whole').first().text().trim();
//                     const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
//                     const mrpMatch = mrpText.match(/₹\d+.\d+/);
//                     const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';
//                     const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();
//                     const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
//                     const sellerLink = $('#aod-offer-soldBy a').attr('href');
//                     const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
//                     const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;

//                     let serp_obj1 = {
//                         price: price,
//                         mrp: mrp,
//                         discount: discount,
//                         condition: conditionElement,
//                         seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
//                         sellerID: sellerId,
//                         ASIN: asin,
//                         SellerListingLink: null // Placeholder, will be updated later if needed
//                     };
//                     if (serp_obj1.seller) {
//                         results.push(serp_obj1);
//                     }

//                     let offerList = $('#aod-offer-list .aod-information-block');
//                     console.log(`ASIN ${asin} - Page ${currentPage}: ${offerList.length} offers found`);

//                     offerList.each((i, elem) => {
//                         let row = cheerio.load($(elem).html());

//                         let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
//                         let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

//                         let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
//                         let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

//                         let href = row('a.a-size-small.a-link-normal').attr('href');
//                         let sellerID = href ? (href.split("seller=")[1] ? href.split("seller=")[1].split("&")[0] : null) : null;

//                         let serp_obj = {
//                             price: price ? price[0].replace(/,/g, '') : 'Unavailable',
//                             mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
//                             discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
//                             condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
//                             seller: row('a.a-size-small.a-link-normal').text().trim(),
//                             sellerID: sellerID,
//                             ASIN: asin,
//                             SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
//                         };

//                         if (serp_obj.seller) {
//                             results.push(serp_obj);
//                         }
//                     });

//                     if (offerList.length >= 10) {
//                         currentPage++;
//                     } else {
//                         hasNextPage = false;
//                     }
//                     success = true; // If we reach here, the request was successful
//                 } catch (error) {
//                     attempts++;
//                     console.error(`Error fetching page ${currentPage} for ASIN ${asin}:`, error.response ? error.response.status : error.message);
//                     if (attempts >= maxRetries) {
//                         hasNextPage = false; // Stop further attempts after max retries
//                     }
//                 }
//             }
//         }
//     }

//     for (let asin of asins) {
//         await scrapeData(asin);
//     }

//     await csvWriter.writeRecords(results)
//         .then(() => {
//             console.log('Data written to CSV file successfully');
//         });

//     res.json(results); // Send the scraped data as JSON response
// });

// app.get('/download', (req, res) => {
//     const filePath = path.join(__dirname, 'results.csv');
//     res.download(filePath, 'results.csv', (err) => {
//         if (err) {
//             console.error('Error downloading the file:', err);
//         }
//     });
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });




















// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const { HttpsProxyAgent } = require('https-proxy-agent');
// const path = require('path');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const app = express();
// const port = 3000;

// const proxyAgent = new HttpsProxyAgent("http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000");

// const headers = {
//     'accept': 'text/html,*/*',
//     'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
//     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
//     'viewport-width': '682',
//     'x-requested-with': 'XMLHttpRequest'
// };

// const maxRetries = 3;

// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.post('/scrape', async (req, res) => {
//     let asins = req.body.asins;
//     let results = [];

//     const csvWriter = createCsvWriter({
//         path: 'results.csv',
//         header: [
//             { id: 'price', title: 'Price' },
//             { id: 'mrp', title: 'MRP' },
//             { id: 'discount', title: 'Discount' },
//             { id: 'condition', title: 'Condition' },
//             { id: 'seller', title: 'Seller' },
//             { id: 'sellerID', title: 'SellerID' },
//             { id: 'ASIN', title: 'ASIN' },
//             { id: 'SellerListingLink', title: 'SellerListingLink' }
//         ]
//     });

//     async function scrapeData(asin) {
//         let currentPage = 1;
//         let hasNextPage = true;

//         while (hasNextPage && currentPage <= 3) {
//             const url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`;
//             let attempts = 0;
//             let success = false;

//             while (attempts < maxRetries && !success) {
//                 try {
//                     const response = await axios.get(url, {
//                         headers,
//                         httpAgent: proxyAgent,
//                         httpsAgent: proxyAgent
//                     });

//                     const content = response.data;
//                     const $ = cheerio.load(content);

//                     const price = $('#aod-price-0 .a-price-whole').first().text().trim();
//                     const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
//                     const mrpMatch = mrpText.match(/₹\d+.\d+/);
//                     const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';
//                     const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();
//                     const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
//                     const sellerLink = $('#aod-offer-soldBy a').attr('href');
//                     const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
//                     const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;

//                     let serp_obj1 = {
//                         price: price,
//                         mrp: mrp,
//                         discount: discount,
//                         condition: conditionElement,
//                         seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
//                         sellerID: sellerId,
//                         ASIN: asin,
//                         SellerListingLink: null // Placeholder, will be updated later if needed
//                     };
//                     if (serp_obj1.seller) {
//                         results.push(serp_obj1);
//                     }

//                     let offerList = $('#aod-offer-list .aod-information-block');
//                     console.log(`ASIN ${asin} - Page ${currentPage}: ${offerList.length} offers found`);

//                     offerList.each((i, elem) => {
//                         let row = cheerio.load($(elem).html());

//                         let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
//                         let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

//                         let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
//                         let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

//                         let href = row('a.a-size-small.a-link-normal').attr('href');
//                         let sellerID = href ? (href.split("seller=")[1] ? href.split("seller=")[1].split("&")[0] : null) : null;

//                         let serp_obj = {
//                             price: price ? price[0].replace(/,/g, '') : 'Unavailable',
//                             mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
//                             discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
//                             condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
//                             seller: row('a.a-size-small.a-link-normal').text().trim(),
//                             sellerID: sellerID,
//                             ASIN: asin,
//                             SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
//                         };

//                         if (serp_obj.seller) {
//                             results.push(serp_obj);
//                         }
//                     });

//                     if (offerList.length >= 10) {
//                         currentPage++;
//                     } else {
//                         hasNextPage = false;
//                     }
//                     success = true; // If we reach here, the request was successful
//                 } catch (error) {
//                     attempts++;
//                     console.error(`Error fetching page ${currentPage} for ASIN ${asin}:`, error.response ? error.response.status : error.message);
//                     if (attempts >= maxRetries) {
//                         hasNextPage = false; // Stop further attempts after max retries
//                     }
//                 }
//             }
//         }
//     }

//     for (let asin of asins) {
//         await scrapeData(asin);
//     }

//     await csvWriter.writeRecords(results)
//         .then(() => {
//             console.log('Data written to CSV file successfully');
//         });

//     res.send('Scraping complete. Data written to CSV file.');
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
















// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const { HttpsProxyAgent } = require('https-proxy-agent');
// const path = require('path');

// const app = express();
// const port = 3000;

// const proxyAgent = new HttpsProxyAgent("http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000");

// const headers = {
//     'accept': 'text/html,*/*',
//     'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
//     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
//     'viewport-width': '682',
//     'x-requested-with': 'XMLHttpRequest'
// };

// const maxRetries = 3;

// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.post('/scrape', async (req, res) => {
//     let asins = req.body.asins;
//     let results = [];

//     async function scrapeData(asin) {
//         let currentPage = 1;
//         let hasNextPage = true;

//         while (hasNextPage && currentPage <= 3) {
//             const url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`;
//             let attempts = 0;
//             let success = false;

//             while (attempts < maxRetries && !success) {
//                 try {
//                     const response = await axios.get(url, {
//                         headers,
//                         httpAgent: proxyAgent,
//                         httpsAgent: proxyAgent
//                     });

//                     const content = response.data;
//                     const $ = cheerio.load(content);

//                     const price = $('#aod-price-0 .a-price-whole').first().text().trim();
//                     const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
//                     const mrpMatch = mrpText.match(/₹\d+.\d+/);
//                     const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';
//                     const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();
//                     const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
//                     const sellerLink = $('#aod-offer-soldBy a').attr('href');
//                     const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
//                     const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;

//                     let serp_obj1 = {
//                         price: price,
//                         mrp: mrp,
//                         discount: discount,
//                         condition: conditionElement,
//                         seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
//                         sellerID: sellerId,
//                         ASIN: asin,
//                     };
//                     if (serp_obj1.seller) {
//                         results.push(serp_obj1);
//                     }

//                     let offerList = $('#aod-offer-list .aod-information-block');
//                     console.log(`ASIN ${asin} - Page ${currentPage}: ${offerList.length} offers found`);

//                     offerList.each((i, elem) => {
//                         let row = cheerio.load($(elem).html());

//                         let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
//                         let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

//                         let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
//                         let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

//                         let href = row('a.a-size-small.a-link-normal').attr('href');
//                         let sellerID = href ? (href.split("seller=")[1] ? href.split("seller=")[1].split("&")[0] : null) : null;

//                         let serp_obj = {
//                             price: price ? price[0].replace(/,/g, '') : 'Unavailable',
//                             mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
//                             discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
//                             condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
//                             seller: row('a.a-size-small.a-link-normal').text().trim(),
//                             sellerID: sellerID,
//                             ASIN: asin,
//                             SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
//                         };

//                         if (serp_obj.seller) {
//                             results.push(serp_obj);
//                         }
//                     });

//                     if (offerList.length >= 10) {
//                         currentPage++;
//                     } else {
//                         hasNextPage = false;
//                     }
//                     success = true; // If we reach here, the request was successful
//                 } catch (error) {
//                     attempts++;
//                     console.error(`Error fetching page ${currentPage} for ASIN ${asin}:`, error.response ? error.response.status : error.message);
//                     if (attempts >= maxRetries) {
//                         hasNextPage = false; // Stop further attempts after max retries
//                     }
//                 }
//             }
//         }
//     }

//     for (let asin of asins) {
//         await scrapeData(asin);
//     }

//     res.json(results);
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });



























// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const { HttpsProxyAgent } = require('https-proxy-agent');

// const proxyAgent = new HttpsProxyAgent("http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000");

// let asins = [

//     "1035513935"
// ];
// Error //fetching page 1 for ASIN 1035513935: Cannot read properties of undefined (reading 'split')
// let results = [];

// const headers = {
//   'accept': 'text/html,*/*',
//   'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
//   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
//   'viewport-width': '682',
//   'x-requested-with': 'XMLHttpRequest'
// };

// const maxRetries = 3;
// const concurrencyLimit = 50;
// const delayBetweenBatches = 5000; // 5 seconds

// async function scrapeData(asin) {
//   let currentPage = 1;
//   let hasNextPage = true;

//   while (hasNextPage && currentPage <= 3) {
//     const url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`;
//     let attempts = 0;
//     let success = false;

//     while (attempts < maxRetries && !success) {
//       try {
//         const response = await axios.get(url, {
//           headers,
//           httpAgent: proxyAgent,
//           httpsAgent: proxyAgent
//         });

//         const content = response.data;
//         const $ = cheerio.load(content);

//         const price = $('#aod-price-0 .a-price-whole').first().text().trim();
//         const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
//         const mrpMatch = mrpText.match(/₹\d+.\d+/);
//         const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';
//         const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();
//         const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
//         const sellerLink = $('#aod-offer-soldBy a').attr('href');
//         const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim() || "";
//         const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;
        

//         let serp_obj1 = {
//           price: price,
//           mrp: mrp,
//           discount: discount,
//           condition: conditionElement,
//           seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
//           sellerID: sellerId,
//           ASIN: asin,
//         };
//         if (serp_obj1.seller) {
//           results.push(serp_obj1);
//         }

//         let offerList = $('#aod-offer-list .aod-information-block');
//         console.log(`ASIN ${asin} - Page ${currentPage}: ${offerList.length} offers found`);

//         offerList.each((i, elem) => {
//           let row = cheerio.load($(elem).html());

//           let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
//           let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

//           let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
//           let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

//           let href = row('a.a-size-small.a-link-normal').attr('href');
//           //let sellerID = href ? href.split("seller=")[1].split("&")[0] : null;
//           let sellerID = href ? (href.split("seller=")[1] ? href.split("seller=")[1].split("&")[0] : null) : null;

//           let serp_obj = {
//             price: price ? price[0].replace(/,/g, '') : 'Unavailable',
//             mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
//             discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
//             condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
//             seller: row('a.a-size-small.a-link-normal').text().trim(),
//             sellerID: sellerID,
//             ASIN: asin,
//             SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
//           };

//           if (serp_obj.seller) {
//             results.push(serp_obj);
//           }
//         });

//         if (offerList.length >= 10) {
//           currentPage++;
//         } else {
//           hasNextPage = false;
//         }
//         success = true; // If we reach here, the request was successful
//       } catch (error) {
//         attempts++;
//         console.error(`Error fetching page ${currentPage} for ASIN ${asin}:`, error.response ? error.response.status : error.message);
//         if (attempts >= maxRetries) {
//           hasNextPage = false; // Stop further attempts after max retries
//         }
//       }
//     }
//   }
// }

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function runScraping() {
//   for (let i = 0; i < asins.length; i += concurrencyLimit) {
//     const batch = asins.slice(i, i + concurrencyLimit);
//     const scrapingTasks = batch.map(asin => scrapeData(asin));

//     await Promise.all(scrapingTasks);

//     if (i + concurrencyLimit < asins.length) {
//       console.log(`Batch ${Math.floor(i / concurrencyLimit) + 1} complete, waiting for ${delayBetweenBatches / 1000} seconds...`);
//       await delay(delayBetweenBatches);
//     }
//   }

//   fs.writeFile('asin_results.json', JSON.stringify(results, null, 2), err => {
//     if (err) console.log('Error writing file:', err);
//     else console.log('Successfully written data to file');
//   });
// }

// runScraping().catch(console.error);









