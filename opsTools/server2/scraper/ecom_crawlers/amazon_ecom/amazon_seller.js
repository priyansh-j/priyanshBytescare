const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const keywords = [
    "9356660271",
    "B0BY8WY32K",
    "B0C4YBMW9R",
    "B0C5X6NYC5",
    "230330479",
    "B0CYX6Y8Z3",
    "935666028X",
    "9387000656",
    "230330460",
    "B0C4YB56T2",
    "B0BW7BTY7Z",
    "B0CZ78ZKL5",
    "B0C4Y9ZXFW",
    "935666031X",
    "B0BX46NGYN",
    "B0BSLQ5TR4",
    "B0BSQP88KC",
    "B0BZML358Z",
    "9356666717",
    "B0C4YVDGVM",
    "9356660328",
    "B0BX3Y98M4",
    "B0C4YRGWSL",
    "B0BZMMDKJW",
    "9356660336",
    "B0CNWC5HN7",
    "B0C5B8KT6B",
    "B0BZMHHZD9",
    "B0C4Y8SD4B",
    "B0C5B8KTC3",
    "9356666490",
    "B0C5X66XL8",
    "9356660344",
    "B0C4YPMXC2",
    "B0CNW4GDXL",
    "9356667977",
    "B0C59Y5V5D",
    "B0CKFTXF2H",
    "9356661197",
    "B0BW7JGVXP",
    "B0BY8PHZNJ",
    "B0CS3B7S94",
    "B0BVQJ5M2C",
    "B0C5BC8NWX",
    "B0C53KZZ6R",
    "B0BWF64H6K",
    "B0C5X4QXRW",
    "B0BVVRTN1D",
    "B0BW7G77ZG",
    "9356661944",
    "B0C5X5K432",
    "B0BVVWJNPW",
    "B0C53LMQ4B",
    "9356667306",
    "B0BW754TVQ",
    "B0BV34WMBZ",
    "B0BW774SJM",
    "B0BW772QJM",
    "B0D153H3CT",
    "B0C37WMTN8",
    "B0BYPJ43MC",
    "B0BRQLPV2W",
    "B0BRQJ945D",
    "B0BRSJYLKP",
    "B0BRSGXTCK",
    "9356667845",
    "B0D47QTR1Z",
    "9356667810",
    "B09V886MZX",
    "B0BZMJYQTY",
    "B0CG25753N",
    "B0BVVQB1PZ",
    "B0BTTH12WY"
  
]; // Example ASINs

async function fetchAndExtract(key) {
    const browser = await puppeteer.launch({headless:false}); // run browser in non-headless mode to visually confirm the page loading
    const page = await browser.newPage();
    let allResults = [];

    for (let pageNum = 1; pageNum <= 1; pageNum++) {
        const pageUrl = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${key}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const body = await page.content();

        // Debug: Save the HTML to a file
        fs.writeFileSync('debug.html', body);

        const results = extractData(body, key);
        allResults.push(...results.results);
    }

    await browser.close();
    
    // Define the filename in a variable
const filename = 'macmilan_daily_seller1.json';

// Save results incrementally
let currentData = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : [];
currentData.push(...allResults);
fs.writeFileSync(filename, JSON.stringify(currentData, null, 2));
    
    return allResults; // Return all results for logging or further processing
}

// function extractData(body, key) {
//     let $ = cheerio.load(body);
//     let results = { state: 'NORMAL', results: [] };

//     // Debug: Log the count of found elements for each category
//     console.log('Pinned Offers Count:', $('div.a-section.a-spacing-none.aod-pinned-offer').length);
//     console.log('Regular Offers Count:', $('div.a-section.a-spacing-none.aod-offer').length);

    // $('div.a-section.a-spacing-none.aod-pinned-offer, div.a-section.a-spacing-none.aod-offer').each((i, elem) => {
    //     const data = extractSellerData($(elem), key);
    //     if (data.seller) { // Ensure that seller data is meaningful
    //         results.results.push(data);
    //     }
    // });

//     results.results_length = results.results.length;
//     return results;
// }


function extractData(body, key) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };

    

    let offerList = $('#aod-offer-list .aod-information-block'); // This will get both pinned and regular offers

  

    offerList.each((i, elem) => {
        let row_selector = cheerio.load($(elem).html());

        // Extracting price and MRP by capturing the first occurrence of a price-like string
        let priceText = row_selector('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
        let mrpText = row_selector('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

        // Using regex to extract the first price occurrence considering potential commas in the price
        let priceMatch = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
        let mrpMatch = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

        let price = priceMatch ? priceMatch[1].replace(',', '') : 'Unavailable';
        let mrp = mrpMatch ? mrpMatch[1].replace(',', '') : 'Unavailable';


        let serp_obj = {
            price: price,
            discount: row_selector('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
            mrp: mrp,
            condition: row_selector('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
            seller: row_selector('a.a-size-small.a-link-normal').text().trim(),
            sellerID: row_selector('a.a-size-small.a-link-normal').attr('href').split("seller=")[1].split("&")[0],
            ASIN: key
        };

        if (serp_obj.seller) {
            results.results.push(serp_obj);
        }
    });

    results.state = 'NORMAL';
    results.results_length = results.results.length;
    return results;
}

// function extractSellerData(element, key) {
//     const $ = cheerio.load(element.html());

//     let price = $('span.a-price-whole').first().text().trim().replace(/[^0-9.]/g, '') || 'NA';
//     let discount = $('.a-color-price').first().text().trim() || 'NA';
//     let mrp = $('.a-price.a-text-price').first().text().trim().replace(/[^0-9.]/g, '') || 'NA';

//     return {
//         price: price,
//         discount: discount,
//         mrp: mrp,
//         condition: $('div.a-fixed-right-grid-col.a-col-left h5').first().text().trim() || 'NA',
//         seller: $('a.a-size-small.a-link-normal').first().text().trim() || 'No seller info',
//         sellerID: $('a.a-size-small.a-link-normal').attr('href') ? $('a.a-size-small.a-link-normal').attr('href').split("seller=")[1].split("&")[0] : 'NA',
//         ASIN: key
//     };
// }

async function scrapeKeywords(keywords) {
    for (const key of keywords) {
        const keywordResults = await fetchAndExtract(key);
        console.log('Data for key:', key, 'has been processed.');
    }
    console.log(`All data has been saved to ${filename}.`);
}

scrapeKeywords(keywords);















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const keywords = ['9359589195'];  // Example ASINs

// async function fetchAndExtract(key) {
//     const browser = await puppeteer.launch({headless:false});
//     const page = await browser.newPage();
//     let allResults = [];

//     for (let pageNum = 1; pageNum <= 1; pageNum++) {
//         const pageUrl = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${key}&pageno=${pageNum}`;
//         await page.goto(pageUrl, { waitUntil: 'networkidle2' });
//         const body = await page.content();
//         const results = extractData(body, key);
//         allResults.push(...results.results);
//     }

//     await page.close();
//     await browser.close();
    
//     // Save results incrementally
//     let currentData = fs.existsSync('macmilan_seller.json') ? JSON.parse(fs.readFileSync('macmilan_seller.json', 'utf8')) : [];
//     currentData.push(...allResults);
//     fs.writeFileSync('macmilan_seller.json', JSON.stringify(currentData, null, 2));
    
//     return allResults;  // Return all results for logging or further processing
// }

// function extractData(body, key) {
//     let $ = cheerio.load(body);
//     let results = { state: 'NORMAL', results: [] };

//     $('div.a-section.a-spacing-none.aod-pinned-offer, div.a-section.a-spacing-none.aod-offer').each((i, elem) => {
//         const data = extractSellerData($(elem), key);
//         if (data.seller) {  // Push only if seller is found
//             results.results.push(data);
//         }
//     });

//     results.results_length = results.results.length;
//     return results;
// }

// function extractSellerData(element, key) {
//     const $ = cheerio.load(element.html());

//     return {
//         price: $('span.a-price-whole').first().text().trim().replace(/[^0-9.]/g, ''),
//         discount: $('.a-color-price').first().text().trim(),
//         mrp: $('.a-price.a-text-price').first().text().trim().replace(/[^0-9.]/g, ''),
//         condition: $('div.a-fixed-right-grid-col.a-col-left h5').first().text().trim(),
//         seller: $('a.a-size-small.a-link-normal').first().text().trim(),
//         sellerID: $('a.a-size-small.a-link-normal').attr('href') ? $('a.a-size-small.a-link-normal').attr('href').split("seller=")[1].split("&")[0] : 'NA',
//         ASIN: key
//     };
// }

// async function scrapeKeywords(keywords) {
//     for (const key of keywords) {
//         const keywordResults = await fetchAndExtract(key);
//         console.log('Data for key:', key, 'has been processed.');
//     }
//     console.log('All data has been saved to macmilan_seller.json.');
// }

// scrapeKeywords(keywords);
