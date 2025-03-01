const puppeteer = require('puppeteer');
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
                { id: 'description', title: 'Description' },
                { id: 'price', title: 'Price' },
                { id: 'discount', title: 'Discount' },
                { id: 'link', title: 'Product Link' },
                { id: 'image', title: 'Image URL' },
                { id: 'original_listing', title: 'Original Listing' }
            ],
            append: false // Write headers if the file doesn't exist
        });
        await csvWriterForHeaders.writeRecords([]); // Write only headers
    }
}

async function fetchAndExtractTataCliq(item, csvWriter, page, browser) {
    let results = [];
    const keyword = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-10'] : item.Title;
    console.log(keyword);
    const searchURL = `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(keyword)}`;

    try {
        // Navigate to the search page
        await page.goto(searchURL, { waitUntil: 'networkidle2' });

        // Extract the HTML content of the page
        const content = await page.content();
        const $ = cheerio.load(content);

        // Process product results
        $('.Grid__element').each((index, element) => {
            let serp_obj = {
                title: $(element).find('.ProductDescription__boldText').first().text().trim(),
                description: $(element).find('.ProductDescription__description').text().trim(),
                price: $(element).find('.ProductDescription__boldText').last().text().trim(),
                discount: $(element).find('.ProductDescription__newDiscountPercent').text().trim(),
                link: 'https://www.tatacliq.com' + $(element).find('a.ProductModule__aTag').attr('href'),
                image: 'https:' + $(element).find('img.Image__actual').attr('src'),
                original_listing: item.Online_Listing || item.TataCliq_Link || ''
            };

            if (serp_obj.link) {
                results.push(serp_obj);
            }
        });

        // Save results incrementally
        if (results.length > 0) {
            await csvWriter.writeRecords(results);
            return true; // Continue loop
        } else {
            console.log(`No data found for ${keyword}, stopping.`);
            return false; // Stop loop
        }

    } catch (error) {
        console.error(`Error fetching data for keyword '${keyword}':`, error);
    }
}

async function scrapeTataCliqItem(item, clientName) {
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'tataCliq.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'title', title: 'Title' },
            { id: 'description', title: 'Description' },
            { id: 'price', title: 'Price' },
            { id: 'discount', title: 'Discount' },
            { id: 'link', title: 'Product Link' },
            { id: 'image', title: 'Image URL' },
            { id: 'original_listing', title: 'Original Listing' }
        ],
        append: true // This will append to the file if it exists
    });

    await writeHeaders(csvFilePath); // Ensure headers are written before scraping

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await fetchAndExtractTataCliq(item, csvWriter, page, browser);

    console.log('All data has been saved to', csvFilePath);

    await browser.close();
}

async function processItem(item, clientName) {
    await scrapeTataCliqItem(item, clientName);
}

module.exports = {
    processItem
};
