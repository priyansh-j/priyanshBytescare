const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
                { id: 'seller', title: 'Seller' },
                { id: 'rating', title: 'Rating' },
                { id: 'price', title: 'Price' },
                { id: 'mrp', title: 'MRP' },
                { id: 'discount', title: 'Discount' },
                { id: 'isbn', title: 'ISBN' }
            ],
            append: false
        });
        await csvWriterForHeaders.writeRecords([]);
    }
}

async function fetchAndExtract(key, browser, csvWriter) {
    let page = await browser.newPage();
    try {
        const pageUrl = `https://www.flipkart.com/sellers?pid=${key}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });

        const body = await page.content();
        const results = extractData(body, key);

        if (results.length > 0) {
            await csvWriter.writeRecords(results);
        }
    } catch (error) {
        console.error(`Error processing ISBN ${key}: ${error}`);
        logError(key, error);
    } finally {
        await page.close();
    }
}

function extractData(body, key) {
    let $ = cheerio.load(body);
    let results = [];
    let organic_results = $('div.UQFoop');

    organic_results.each((i, elem) => {
        let row = cheerio.load($(elem).html());
        let serp_obj = {
            seller: row('div.EElWwG span').text().trim(),
            rating: row('div.XQDdHH').text().trim(),
            price: row('div.Nx9bqj').text().trim(),
            mrp: row('div.yRaY8j').text().trim(),
            discount: row('div.UkUFwK span').text().trim(),
            isbn: key
        };

        if (serp_obj.seller) {
            results.push(serp_obj);
        }
    });

    console.log(`Found ${results.length} results for ISBN: ${key}`);
    return results;
}

async function logError(key, error) {
    let existingErrors = [];
    const errorFilePath = 'error_isbn.json';
    if (fs.existsSync(errorFilePath)) {
        existingErrors = JSON.parse(fs.readFileSync(errorFilePath));
    }
    existingErrors.push({ isbn: key, error: error.message });
    fs.writeFileSync(errorFilePath, JSON.stringify(existingErrors, null, 2));
    console.log(`Error for ISBN: ${key} logged to file.`);
}

async function scrapeItem(item, clientName) {
    let browser;
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'flipkart_seller.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'seller', title: 'Seller' },
            { id: 'rating', title: 'Rating' },
            { id: 'price', title: 'Price' },
            { id: 'mrp', title: 'MRP' },
            { id: 'discount', title: 'Discount' },
            { id: 'isbn', title: 'ISBN' }
        ],
        append: true
    });

    try {
        browser = await createBrowser();
        await writeHeaders(csvFilePath);
        await fetchAndExtract(item['ISBN-13'], browser, csvWriter);
       // console.log(`Data for ISBN: ${item['ISBN-13']} has been processed and saved.`);
    } catch (error) {
        console.error(`Encountered an error: ${error}. Restarting browser.`);
        browser = await createBrowser();
        await fetchAndExtract(item['ISBN-13'], browser, csvWriter);
        //console.log(`Data for ISBN: ${item['ISBN-13']} has been processed and saved after restarting the browser.`);
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
