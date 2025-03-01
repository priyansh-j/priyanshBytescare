const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs'); // Require fs module to handle file operations

// Array of keywords to search
const keywords = [
    "9789389335408",
    "9789395736480",
    "9789393553263",

];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Open a write stream to a file
    const stream = fs.createWriteStream('results.json', { flags: 'w' }); // Use 'w' to overwrite existing content

    // Write an opening bracket for the JSON array at the start of the file
    stream.write('[\n');

    for (const [index, key] of keywords.entries()) {
        const url = `https://www.aibh.in/search-products?search=${key}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const body = await page.content();
        const $ = cheerio.load(body);
        let results = [];

        // Check for CAPTCHA
        let block_text = $('div#infoDiv').text();
        if (block_text.includes('solve the CAPTCHA if you are using advanced terms that robots are known to use')) {
            continue; // Skip this iteration if CAPTCHA is detected
        }

        let no_results = $('.card-section > div > b');
        if (no_results.length > 0) {
            continue; // Skip this iteration if no accurate results are found
        }

        // Parse results
        let organic_results = $('div.products-list__body > div.products-list__item:has(div.product-card)');
        organic_results.each(function() {
            let row_selector = cheerio.load($(this).html());
            let serp_obj = {
                title: row_selector('div.product-card__name > a').first().text().trim(),
                source: row_selector('div.product-card__name > a').first().attr('href'),
                price: row_selector('span.product-card__new-price').first().text().replace(/[^0-9.]/g, ''),
                mrp: row_selector('span.product-card__old-price').first().text().replace(/[^0-9.]/g, ''),
                cover: row_selector('img.product-image__img').attr('src'),
                author: row_selector('span.author-title > a').first().text().trim(), // Extracting author information
                ISBN:key
            };

            if (serp_obj.source && serp_obj.source !== '' && serp_obj.source !== 'NA- Out of Stock') {
                results.push(serp_obj);
            }
        });

        // Write results to the file
        if (results.length > 0) {
            stream.write(JSON.stringify(results, null, 2));
            if (index < keywords.length - 1) {
                stream.write(',\n');
            }
        }
    }

    // Write a closing bracket for the JSON array at the end of the file
    stream.write('\n]');
    stream.end();

    await browser.close();
})();









// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs'); // Require fs module to handle file operations

// // Array of keywords to search
// const keywords = [
//     "9789389335408",
//     // List other keywords
// ];

// // Initialize an array to store all results
// let allResults = [];

// (async () => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     for (const key of keywords) {
//         const url = `https://www.aibh.in/search-products?search=${key}`;
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         const body = await page.content();
//         const $ = cheerio.load(body);

//         // Check for CAPTCHA
//         let block_text = $('div#infoDiv').text();
//         if (block_text.includes('solve the CAPTCHA if you are using advanced terms that robots are known to use')) {
//             continue; // Skip this iteration if CAPTCHA is detected
//         }

//         let no_results = $('.card-section > div > b');
//         if (no_results.length > 0) {
//             continue; // Skip this iteration if no accurate results are found
//         }

//         // Parse results
//         let organic_results = $('div.products-list__body > div.products-list__item:has(div.product-card)');
//         organic_results.each(function() {
//             let row_selector = cheerio.load($(this).html());
//             let serp_obj = {
//                 title: row_selector('div.product-card__name > a').first().text().trim(),
//                 source: row_selector('div.product-card__name > a').first().attr('href'),
//                 price: row_selector('span.product-card__new-price').first().text().replace(/[^0-9.]/g, ''),
//                 Img: row_selector('img.product-image__img').attr('src'),
//                 author: row_selector('span.author-title > a').first().text().trim(), // Extracting author information
//             };

//             if (serp_obj.source && serp_obj.source !== '' && serp_obj.source !== 'NA- Out of Stock') {
//                 allResults.push(serp_obj);
//             }
//         });
//     }

//     // After all keywords are processed, write the collected results to a file
//     fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2), 'utf-8');

//     await browser.close();
// })();


