const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvHeaders = [
    {id: 'title', title: 'Title'},
    {id: 'source', title: 'Source'},
    {id: 'price', title: 'Price'},
    {id: 'mrp', title: 'MRP'},
    {id: 'discount', title: 'Discount'},
    {id: 'author', title: 'Author'},
    {id: 'cover', title: 'Cover'},
    {id: 'original_listing', title: 'Original Listing'}
];

async function writeHeaders(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: csvHeaders,
            append: false
        });
        await csvWriterForHeaders.writeRecords([]);
    }
}

async function createBrowser() {
    try {
        return await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
    } catch (error) {
        console.error('Error launching browser:', error);
        throw error;
    }
}

async function fetchAndExtract(item, browser, csvWriter, retries = 3) {
    let page;
    let allResults = [];
    const query = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-13'] : item.Title;
    const url = `https://www.snapdeal.com/search?keyword=${query}&sort=rlvncy`;

    while (retries > 0) {
        try {
            page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });

            const body = await page.content();
            const results = extractData(body, item);

            if (results.state === 'CAPTCHA_DETECTED') {
                console.log(`CAPTCHA detected for query: ${query}`);
                return;
            } else {
                allResults.push(...results.results);
                await csvWriter.writeRecords(allResults);
                allResults = [];
                break; // Exit the loop if successful
            }
        } catch (error) {
            console.error(`Error fetching data for query '${query}': ${error}`);
            retries--;

            if (retries > 0) {
                console.log(`Retrying... Attempts left: ${retries}`);
                await browser.close(); // Close the current browser instance
                browser = await createBrowser(); // Create a new browser instance
            } else {
                console.log('No more retries left.');
            }
        } finally {
            if (page) {
                await page.close();
            }
        }
    }
}

function extractData(body, item) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };
    let block_text = $('div#infoDiv').text();

    if (block_text.includes('solve the CAPTCHA')) {
        results.state = 'CAPTCHA_DETECTED';
        return results;
    }

    let organic_results = $('div.col-xs-6.favDp.product-tuple-listing.js-tuple');
    organic_results.each((index, element) => {
        let row_selector = cheerio.load($(element).html());
        let priceInfo = row_selector('div.sc-AxhCb.jSpsgy');

        let serp_obj = {
            title: row_selector('div.product-tuple-description > div.product-desc-rating > a > p').attr('title'),
            source: row_selector('div.product-tuple-image > a').attr('href'),
            price: row_selector('span.lfloat.product-price').text().replace('Rs.', '').trim(),
            mrp: row_selector('span.lfloat.product-desc-price.strike').text().replace('Rs.', '').trim(),
            author: row_selector('p.product-author-name').attr('title'),
            discount: row_selector('div.product-discount').text().trim(),
            cover: row_selector('div.product-tuple-image > a > picture > img').attr('src'), // Updated selector
            original_listing: item.Online_Listing || ''
        };

        if (serp_obj.source && serp_obj.source !== '' && serp_obj.source !== 'NA- Out of Stock') {
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
    const csvFilePath = path.join(outputDir, 'snapdeal.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: csvHeaders,
        append: true
    });

    try {
        browser = await createBrowser();
        await writeHeaders(csvFilePath);
        await fetchAndExtract(item, browser, csvWriter);
    } catch (error) {
        console.error(`Encountered an error: ${error}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    console.log('All data has been saved to', csvFilePath);
}

async function processItem(item, clientName) {
    await scrapeItem(item, clientName);
}

module.exports = {
    processItem
};
