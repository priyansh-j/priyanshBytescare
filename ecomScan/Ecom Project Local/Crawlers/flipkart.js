const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');

async function createBrowser() {
    try {
        return await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    } catch (error) {
        console.error('Error launching browser:', error);
    }
}

async function writeHeaders(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'title', title: 'Title' },
                { id: 'Isbn13', title: 'ISBN-13' },
                { id: 'source', title: 'Source' },
                { id: 'cover', title: 'Cover' },
                { id: 'price', title: 'Price' },
                { id: 'mrp', title: 'MRP' },
                { id: 'discount', title: 'Discount' },
                { id: 'Format', title: 'Format' },
                { id: 'rating', title: 'Rating' },
                { id: 'original_listing', title: 'Original Listing' }
            ],
            append: false // This will write headers if the file does not exist
        });
        await csvWriterForHeaders.writeRecords([]); // Writing headers
    }
}

async function readExistingRecords(csvFilePath) {
    return new Promise((resolve, reject) => {
        const records = [];
        if (!fs.existsSync(csvFilePath)) {
            resolve(records);
        } else {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => records.push(data))
                .on('end', () => resolve(records))
                .on('error', (error) => reject(error));
        }
    });
}

async function fetchAndExtract(item, browser, csvWriter, existingRecords) {
    let page = await browser.newPage();
    let allResults = [];

    for (let pageNum = 1; pageNum <= 25; pageNum++) { // Scraping up to 5 pages
        try {
            const query = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-13'] : item.Title;
            const pageUrl = `https://www.flipkart.com/search?q=${query}&page=${pageNum}`;

            await page.goto(pageUrl, { waitUntil: 'networkidle2' });

            const body = await page.content();
            const results = extractData(body, pageNum, item);

            if (results.results.length === 0) {
                console.log(`No data found for ${query} on page ${pageNum}, breaking the loop.`);
                break; // If no data found, break the loop for this query
            }

            // Filter out duplicates
            const newResults = results.results.filter(result => !existingRecords.some(record => record.source === result.source));
            if (newResults.length > 0) {
                allResults.push(...newResults);
                await csvWriter.writeRecords(newResults);
                existingRecords.push(...newResults); // Update existing records to include newly added records
            }
        } catch (error) {
            console.error(`Error on page ${pageNum} for item '${item.Title}': ${error}`);
            browser = await createBrowser(); // Restart browser
            page = await browser.newPage();
        }
    }

    await page.close();
}

function extractData(body, page, item) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };
    let organic_results = $('div.slAVV4');

    organic_results.each((i, elem) => {
        let row_selector = cheerio.load($(elem).html());
        var fullUrl = `https://www.flipkart.com${row_selector('a').first().attr('href')}`;
        var parsedUrl = new URL(fullUrl);
        var cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

        let extractedIsbn13 = parsedUrl.searchParams.get("pid");
        let inputIsbn13 = item['ISBN-13'];
        let mrp = row_selector('.yRaY8j').text().trim();
        let price = row_selector('.Nx9bqj').text().trim();

        let serp_obj = {
            title: row_selector('a.wjcEIp').attr('title'),
            Isbn13: extractedIsbn13,         //inputIsbn13 ? (extractedIsbn13 === inputIsbn13 ? `${inputIsbn13} (match)` : `${extractedIsbn13} (mismatch)`) : extractedIsbn13,
            source: cleanUrl,
            cover: row_selector('img.DByuf4').attr('src'),
            // price: item.minimum_price ? (price <= item.minimum_price.toString() ? `${price} (true)` : `${price} (false)`) : price,
            price:price,
            mrp: mrp,  //item.mrp ? (mrp === item.mrp.toString() ? `${mrp} (match)` : `${mrp} (mismatch)`) : mrp,
            discount: row_selector('.UkUFwK span').text().trim(),
            Format: row_selector('.NqpwHC').text().trim(), // Assuming this is the location for author
            rating: row_selector('.XQDdHH').text().trim(), // Assuming this fetches the rating
            original_listing: item.Online_Listing || item.Flipkart_Link || ''
        };

        if (serp_obj.source) {
            results.results.push(serp_obj);
        }
    });

    results.state = 'NORMAL';
    results.results_length = results.results.length;
    return results;
}

async function scrapeItem(item, clientName) {
    let browser;
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'flipkart.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'title', title: 'Title' },
            { id: 'Isbn13', title: 'ISBN-13' },
            { id: 'source', title: 'Source' },
            { id: 'cover', title: 'Cover' },
            { id: 'price', title: 'Price' },
            { id: 'mrp', title: 'MRP' },
            { id: 'discount', title: 'Discount' },
            { id: 'Format', title: 'Format' },
            { id: 'rating', title: 'Rating' },
            { id: 'original_listing', title: 'Original Listing' }
        ],
        append: true // This will append to the file if it exists
    });

    try {
        const existingRecords = await readExistingRecords(csvFilePath);
        browser = await createBrowser();
        await writeHeaders(csvFilePath);
        await fetchAndExtract(item, browser, csvWriter, existingRecords);
    } catch (error) {
        console.error(`Encountered an error: ${error}. Restarting browser.`);
        browser = await createBrowser();
        await fetchAndExtract(item, browser, csvWriter, existingRecords);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    console.log('All data has been saved to', csvFilePath);
}

// Function to process items from the main script
async function processItem(item, clientName) {
    await scrapeItem(item, clientName);
}

module.exports = {
    processItem
};



















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const path = require('path');
// const url = require('url');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// async function createBrowser() {
//     try {
//         return await puppeteer.launch({args: [ '--no-sandbox','--disable-setuid-sandbox']});
//     } catch (error) {
//         console.error('Error launching browser:', error);
//     }
// }
// async function writeHeaders(csvFilePath) {
//     if (!fs.existsSync(csvFilePath)) {
//         const csvWriterForHeaders = createCsvWriter({
//             path: csvFilePath,
//             header: [
//                 {id: 'title', title: 'Title'},
//                 {id: 'Isbn13', title: 'ISBN-13'},
//                 {id: 'source', title: 'Source'},
//                 {id: 'cover', title: 'Cover'},
//                 {id: 'price', title: 'Price'},
//                 {id: 'mrp', title: 'MRP'},
//                 {id: 'discount', title: 'Discount'},
//                 {id: 'Format', title: 'Format'},
//                 {id: 'rating', title: 'Rating'},
//                 {id: 'original_listing', title: 'Original Listing'}
//             ],
//             append: false // This will write headers if the file does not exist
//         });
//         await csvWriterForHeaders.writeRecords([]); // Writing headers
//     }
// }
// async function fetchAndExtract(item, browser, csvWriter) {
//     let page = await browser.newPage();
//     let allResults = [];

//     for (let pageNum = 1; pageNum <= 5; pageNum++) { // Scraping up to 4 pages
//         try {
//             const query = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-13'] : item.Title;
//             const pageUrl = `https://www.flipkart.com/search?q=${query}&page=${pageNum}`;
            
//             await page.goto(pageUrl, { waitUntil: 'networkidle2' });

//             const body = await page.content();
//             const results = extractData(body, pageNum, item);

//             if (results.results.length === 0) {
//                 console.log(`No data found for ${query} on page ${pageNum}, breaking the loop.`);
//                 break; // If no data found, break the loop for this query
//             }

//             allResults.push(...results.results);

//             // Save results incrementally
//             await csvWriter.writeRecords(allResults);
//             allResults = []; // Clear allResults for next page
//         } catch (error) {
//             console.error(`Error on page ${pageNum} for item '${item.Title}': ${error}`);
//             browser = await createBrowser(); // Restart browser
//             page = await browser.newPage();
//         }
//     }

//     await page.close();
// }

// function extractData(body, page, item) {
//     let $ = cheerio.load(body);
//     let results = { state: '', results: [] };
//     let organic_results = $('div.slAVV4');

//     organic_results.each((i, elem) => {
//         let row_selector = cheerio.load($(elem).html());
//         var fullUrl = `https://www.flipkart.com${row_selector('a').first().attr('href')}`;
//         var parsedUrl = new URL(fullUrl);
//         var cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

//         let extractedIsbn13 = parsedUrl.searchParams.get("pid");
//         let inputIsbn13 = item['ISBN-13'];
//         let mrp = row_selector('.yRaY8j').text().trim();
//         //let inputMrp = item.mrp.toString();
//         let price = row_selector('.Nx9bqj').text().trim();
//         //let inputPrice = item.minimum_price.toString();

//         let serp_obj = {
//             title: row_selector('a.wjcEIp').attr('title'),
//             Isbn13: inputIsbn13 ? (extractedIsbn13 === inputIsbn13 ? `${inputIsbn13} (match)` : `${extractedIsbn13} (mismatch)`) : extractedIsbn13,
//             source: cleanUrl,
//             cover: row_selector('img.DByuf4').attr('src'),
//             // price: inputPrice ? (extractedPrice === inputPrice ? `${extractedPrice} (match)` : `${extractedPrice} (mismatch)`) : extractedPrice,
//             // mrp: inputMrp ? (extractedMrp === inputMrp ? `${extractedMrp} (match)` : `${extractedMrp} (mismatch)`) : extractedMrp,
//             price: item.minimum_price ? (price <= item.minimum_price.toString() ? `${price} (true)` : `${price} (false)`)  : price,
//             mrp: item.mrp ? (mrp === item.mrp.toString() ? `${mrp} (match)` : `${mrp} (mismatch)`) : mrp,
//             discount: row_selector('.UkUFwK span').text().trim(),
//             Format: row_selector('.NqpwHC').text().trim(), // Assuming this is the location for author
//             rating: row_selector('.XQDdHH').text().trim(), // Assuming this fetches the rating
//             original_listing: item.Online_Listing || item.Flipkart_Link || ''
//         };

//         if (serp_obj.source) {
//             results.results.push(serp_obj);
//         }
//     });

//     results.state = 'NORMAL';
//     results.results_length = results.results.length;
//     return results;
// }

// async function scrapeItem(item, clientName) {
//     let browser;
//     const outputDir = path.join(__dirname, 'Output_Data', clientName);
//     const csvFilePath = path.join(outputDir, 'flipkart.csv');

//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const csvWriter = createCsvWriter({
//         path: csvFilePath,
//         header: [
//             {id: 'title', title: 'Title'},
//             {id: 'Isbn13', title: 'ISBN-13'},
//             {id: 'source', title: 'Source'},
//             {id: 'cover', title: 'Cover'},
//             {id: 'price', title: 'Price'},
//             {id: 'mrp', title: 'MRP'},
//             {id: 'discount', title: 'Discount'},
//             {id: 'Format', title: 'Format'},
//             {id: 'rating', title: 'Rating'},
//             {id: 'original_listing', title: 'Original Listing'}
//         ],
//         append: true // This will append to the file if it exists
//     });

//     try {
//         browser = await createBrowser();
//         await writeHeaders(csvFilePath);

//         await fetchAndExtract(item, browser, csvWriter);
//     } catch (error) {
//         console.error(`Encountered an error: ${error}. Restarting browser.`);
//         browser = await createBrowser();
//         await fetchAndExtract(item, browser, csvWriter);
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
//     console.log('All data has been saved to', csvFilePath);
// }

// // Function to process items from the main script
// async function processItem(item, clientName) {
//     await scrapeItem(item, clientName);
// }

// module.exports = {
//     processItem
// };











// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const path = require('path');
// const url = require('url');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const csvParser = require('csv-parser'); // Add this for reading CSV files

// async function createBrowser() {
//     try {
//         return await puppeteer.launch({args: [ '--no-sandbox','--disable-setuid-sandbox']});
//     } catch (error) {
//         console.error('Error launching browser:', error);
//     }
// }

// async function fetchAndExtract(item, browser, csvWriter, existingRecords) {
//     let page = await browser.newPage();
//     let allResults = [];

//     for (let pageNum = 1; pageNum <= 4; pageNum++) { // Scraping up to 4 pages
//         try {
//             const query = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-13'] : item.Title;
//             const pageUrl = `https://www.flipkart.com/search?q=${query}&page=${pageNum}`;
            
//             await page.goto(pageUrl, { waitUntil: 'networkidle2' });

//             const body = await page.content();
//             const results = extractData(body, pageNum, item);

//             if (results.results.length === 0) {
//                 console.log(`No data found for ${query} on page ${pageNum}, breaking the loop.`);
//                 break; // If no data found, break the loop for this query
//             }

//             // Filter out duplicates
//             const newResults = results.results.filter(result => !existingRecords.has(result.source));
//             if (newResults.length > 0) {
//                 allResults.push(...newResults);

//                 // Save results incrementally
//                 await csvWriter.writeRecords(newResults);
//             }
//         } catch (error) {
//             console.error(`Error on page ${pageNum} for item '${item.Title}': ${error}`);
//             browser = await createBrowser(); // Restart browser
//             page = await browser.newPage();
//         }
//     }

//     await page.close();
// }

// function extractData(body, page, item) {
//     let $ = cheerio.load(body);
//     let results = { state: '', results: [] };
//     let organic_results = $('div.slAVV4');

//     organic_results.each((i, elem) => {
//         let row_selector = cheerio.load($(elem).html());
//         var fullUrl = `https://www.flipkart.com${row_selector('a').first().attr('href')}`;
//         var parsedUrl = new URL(fullUrl);
//         var cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

//         let extractedIsbn13 = parsedUrl.searchParams.get("pid");
//         let inputIsbn13 = item['ISBN-13'];
//         let mrp = row_selector('.yRaY8j').text().trim();
//         let price = row_selector('.Nx9bqj').text().trim();

//         let serp_obj = {
//             title: row_selector('a.wjcEIp').attr('title'),
//             Isbn13: inputIsbn13 ? (extractedIsbn13 === inputIsbn13 ? `${inputIsbn13} (match)` : `${extractedIsbn13} (mismatch)`) : extractedIsbn13,
//             source: cleanUrl,
//             cover: row_selector('img.DByuf4').attr('src'),
//             price: item.minimum_price ? (price <= item.minimum_price.toString() ? `${price} (true)` : `${price} (false)`)  : price,
//             mrp: item.mrp ? (mrp === item.mrp.toString() ? `${mrp} (match)` : `${mrp} (mismatch)`) : mrp,
//             discount: row_selector('.UkUFwK span').text().trim(),
//             Format: row_selector('.NqpwHC').text().trim(), // Assuming this is the location for author
//             rating: row_selector('.XQDdHH').text().trim(), // Assuming this fetches the rating
//             original_listing: item.Online_Listing || item.Flipkart_Link || ''
//         };

//         if (serp_obj.source) {
//             results.results.push(serp_obj);
//         }
//     });

//     results.state = 'NORMAL';
//     results.results_length = results.results.length;
//     return results;
// }

// async function loadExistingRecords(csvFilePath) {
//     return new Promise((resolve, reject) => {
//         if (!fs.existsSync(csvFilePath)) {
//             resolve(new Set());
//             return;
//         }

//         const records = new Set();
//         fs.createReadStream(csvFilePath)
//             .pipe(csvParser())
//             .on('data', (row) => {
//                 records.add(row.source);
//             })
//             .on('end', () => {
//                 resolve(records);
//             })
//             .on('error', (error) => {
//                 reject(error);
//             });
//     });
// }

// async function scrapeItem(item, clientName) {
//     let browser;
//     const outputDir = path.join(__dirname, 'Output_Data', clientName);
//     const csvFilePath = path.join(outputDir, 'flipkart.csv');

//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const csvWriter = createCsvWriter({
//         path: csvFilePath,
//         header: [
//             {id: 'title', title: 'Title'},
//             {id: 'Isbn13', title: 'ISBN-13'},
//             {id: 'source', title: 'Source'},
//             {id: 'cover', title: 'Cover'},
//             {id: 'price', title: 'Price'},
//             {id: 'mrp', title: 'MRP'},
//             {id: 'discount', title: 'Discount'},
//             {id: 'Format', title: 'Format'},
//             {id: 'rating', title: 'Rating'},
//             {id: 'original_listing', title: 'Original Listing'}
//         ],
//         append: false // This will append to the file if it exists
//     });

//     try {
//         browser = await createBrowser();
//         const existingRecords = await loadExistingRecords(csvFilePath); // Load existing records

//         await fetchAndExtract(item, browser, csvWriter, existingRecords);
//     } catch (error) {
//         console.error(`Encountered an error: ${error}. Restarting browser.`);
//         browser = await createBrowser();
//         const existingRecords = await loadExistingRecords(csvFilePath); // Load existing records
//         await fetchAndExtract(item, browser, csvWriter, existingRecords);
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
//     console.log('All data has been saved to', csvFilePath);
// }

// // Function to process items from the main script
// async function processItem(item, clientName) {
//     await scrapeItem(item, clientName);
// }

// module.exports = {
//     processItem
// };
