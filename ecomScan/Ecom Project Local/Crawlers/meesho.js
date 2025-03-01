const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Write headers to CSV if the file does not exist
async function writeHeaders(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'title', title: 'Title' },
                { id: 'ISBN', title: 'ISBN' },
                { id: 'source', title: 'Source' },
                { id: 'cover', title: 'Cover' },
                { id: 'price', title: 'Price' },
                { id:'seller', title: 'Seller'},
                { id: 'sellerrating', title: 'SellerRating' },
                { id: 'original_listing', title: 'Original Listing' }
            ],
            append: false // This will write headers if the file does not exist
        });
        await csvWriterForHeaders.writeRecords([]); // Writing headers
    }
}

// Fetch seller info from Meesho
async function fetchSellerInfo(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const selector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';

        const shopInfo = $(selector).map((i, element) => {
            const seller = $(element).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
            const sellerRating = $(element).find('span.jkpPSq').text();
            return { seller, sellerRating };
        }).get();

        return shopInfo.length > 0 ? shopInfo[0] : null;
    } catch (error) {
        console.error('Error fetching seller info:', error);
        return null;
    }
}

// Fetch and extract data from Meesho
async function fetchAndExtract(item, csvWriter, page = 1, retryLimit = 3) {
    let results = [];
    const keyword = item.Title;
    try {
        const apiUrl = 'https://www.meesho.com/api/v1/products/search';
        const requestBody = {
            "query": keyword,
            "type": "text_search",
            "page": page,
            "offset": 50 * (page - 1),
            "limit": 50,
            "cursor": null,
            "isDevicePhone": false
        };

        const response = await axios.post(apiUrl, requestBody);
        const catalogs = response.data.catalogs;

        const extractedData = await Promise.all(catalogs.map(async catalog => {
            const slug = catalog.slug;
            const images = catalog.product_images.length > 0 ? catalog.product_images[0].url : null;
            const minProductPrice = catalog.min_product_price;
            const isbnMatch = catalog.full_details.match(/ISBN:\s+(\d+)/);
            const isbn = isbnMatch ? isbnMatch[1] : null;
            const product_id = catalog.product_id;
            const source = `https://www.meesho.com/${slug}/p/${product_id}`;

            // Fetch seller info
            // const sellerInfo = await fetchSellerInfo(source);
            // const seller = sellerInfo ? sellerInfo.seller : null;
            // const sellerRating = sellerInfo ? sellerInfo.sellerRating : null;

            return {
                title: slug || null,
                ISBN: isbn || null,
                source: source || null,
                cover: images || null,
                price: minProductPrice || null,
                //seller:seller || null,
                //sellerrating: sellerRating || null,
                original_listing: item.Online_Listing || item.Meesho_Link || ''
            };
        }));

        results.push(...extractedData);

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
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            return fetchAndExtract(item, csvWriter, page, retryLimit - 1);
        }
    }
}

// Scrape item and save data to CSV
async function scrapeItem(item, clientName) {
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'meesho.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'title', title: 'Title' },
            { id: 'ISBN', title: 'ISBN' },
            { id: 'source', title: 'Source' },
            { id: 'cover', title: 'Cover' },
            { id: 'price', title: 'Price' },
            { id:'seller', title: 'Seller'},
            { id: 'sellerrating', title: 'SellerRating' },
            { id: 'original_listing', title: 'Original Listing' }
        ],
        append: true // This will append to the file if it exists
    });

    await writeHeaders(csvFilePath); // Ensure headers are written before scraping

    for (let page = 1; page <= 5; page++) {
        const shouldContinue = await fetchAndExtract(item, csvWriter, page);
        if (!shouldContinue) {
            break;
        }
    }

    console.log('All data has been saved to', csvFilePath);
}

// Process item for scraping
async function processItem(item, clientName) {
    await scrapeItem(item, clientName);
}

module.exports = {
    processItem
};
