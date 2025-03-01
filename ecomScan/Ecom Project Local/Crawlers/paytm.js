const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function writeHeaders(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'title', title: 'Title' },
                { id: 'source', title: 'Source' },
                { id: 'price', title: 'Price' },
                { id: 'original_listing', title: 'Original Listing' }
            ],
            append: false // Write headers if the file doesn't exist
        });
        await csvWriterForHeaders.writeRecords([]); // Write only headers
    }
}

async function fetchAndExtractPaytm(item, csvWriter, page = 1, retryLimit = 3) {
    let results = [];
    const keyword = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-10'] : item.Title;
    const url = `https://paytmmall.com/shop/search?q=${encodeURIComponent(keyword)}&page=${page}`;

    try {
        // Fetch the page content
        const { data: body } = await axios.get(url);
        let $ = cheerio.load(body);

        // Check for CAPTCHA detection
        let block_text = $('div#infoDiv').text();
        if (block_text.includes('solve the CAPTCHA')) {
            console.log('CAPTCHA detected, retrying...');
            if (retryLimit > 0) {
                await fetchAndExtractPaytm(item, csvWriter, page, retryLimit - 1);
            }
            return;
        }

        // Process organic results
        let organic_results = $('div._2i1r');
        organic_results.each((i, elem) => {
            let row_selector = cheerio.load($(elem).html());
            let title = row_selector('.UGUy').text().trim();
            let source = "https://paytmmall.com" + row_selector('a._8vVO').attr('href');
            let price = row_selector('div._1kMS').text().replace('-31%', '').trim();

            let serp_obj = {
                title: title,
                source: source,
                price: price,
                original_listing: item.Online_Listing || item.Paytm_Link || ''
            };

            if (serp_obj.source) {
                results.push(serp_obj);
            }
        });

        // Save results incrementally
        if (results.length > 0) {
            await csvWriter.writeRecords(results);
            return true; // Continue loop
        } else {
            console.log(`No data found for ${keyword} on page ${page}, stopping.`);
            return false; // Stop loop
        }

    } catch (error) {
        console.error(`Error fetching data for keyword '${keyword}' on page ${page}:`, error);
        if (retryLimit > 0) {
            console.log(`Retrying... (${retryLimit} attempts left)`);
            await fetchAndExtractPaytm(item, csvWriter, page, retryLimit - 1);
        }
    }
}

async function scrapePaytmItem(item, clientName) {
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'paytm.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'title', title: 'Title' },
            { id: 'source', title: 'Source' },
            { id: 'price', title: 'Price' },
            { id: 'original_listing', title: 'Original Listing' }
        ],
        append: true // This will append to the file if it exists
    });

    await writeHeaders(csvFilePath); // Ensure headers are written before scraping

    for (let page = 1; page <= 5; page++) {
        const shouldContinue = await fetchAndExtractPaytm(item, csvWriter, page);
        if (!shouldContinue) {
            break;
        }
    }

    console.log('All data has been saved to', csvFilePath);
}

async function processItem(item, clientName) {
    await scrapePaytmItem(item, clientName);
}

module.exports = {
    processItem
};
