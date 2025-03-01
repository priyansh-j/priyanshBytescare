const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

let asins = [
    "8194476410",
"8194476445",
"8194476453",
"8194476488",
"8195645704",
"8195645712",
"8195645739",
"8195645763",
"8195645771",
"819564578X",
"B082W1NJ7Y",
"B084YPHJ3D",
"B085BM7KV3",
"B08C36XXY1",
"B08ZKFPGX6",
"B09QSZFFBW",
"B09SV649DQ",
"B09WR1S5TG",
"B0BY3FN1V9",
"B0C7P55S6D",
"B0CFY55TSK",
"B0CJ5LYB6Q",
"B0CJ5M5QMM",
"B0CK618PS3",
"B0CTMY6XS2",
"B0CV45PQLP",
"B0CX587N6V",
"B0CXN3KHC3",
"B0CY564S9J",
"B0D337KHJN",
"B0D7SG6QJN",
"B0D9BYYL3S",
"B0D9JNQNQN",
"B0DDCQHD2H",
"B0DFPW4FJS",
"B0DJBW5DQS",
"B0DJTDFFZJ"


];

let results = [];

async function scrapeData(asin) {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
   // await page.waitForTimeout(5000);

    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= 3) {
       // await page.goto(`https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`, {
           await page.goto(` https://www.amazon.in/gp/product/ajax/ref=aod_page_${currentPage}?asin=${asin}&m=&qid=1720069532&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=8-1&pc=dp&isonlyrenderofferlist=true&pageno=${currentPage}&experienceId=aodAjaxMain`,{
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(5000);
        const content = await page.content();
        const $ = cheerio.load(content);

        const price = $('#aod-price-0 .a-price-whole').first().text().trim();
        // const mrp = $('#aod-price-0 .a-text-price').first().text().trim().match(/₹\d+.\d+/)[0];
        const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
        const mrpMatch = mrpText.match(/₹\d+.\d+/);
        const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';  // Default to 'Unavailable' if no match found

        const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();

        // Extracting seller information
        const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
        const sellerLink = $('#aod-offer-soldBy a').attr('href');
        const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
        const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;
         
        let serp_obj1 = {
            price: price,
            mrp:  mrp,
            discount: discount,
            condition: conditionElement,
            //seller: soldBy+"(drop box)",
            seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
            sellerID: sellerId,
            ASIN: asin,
            SellerListingLink:`https://www.amazon.in/gp/product/${asin}?smid=${sellerId}&psc=1`
        };
        if (serp_obj1.seller) {
            results.push(serp_obj1);
        }

        let offerList = $('#aod-offer-list .aod-information-block');
        console.log(`Page ${currentPage}: ${offerList.length} offers found`);

        offerList.each((i, elem) => {
            let row = cheerio.load($(elem).html());

            let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
            let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

            let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
            let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

            let href = row('a.a-size-small.a-link-normal').attr('href');
            let sellerID = href ? href.split("seller=")[1].split("&")[0] : null;

            let serp_obj = {
                price: price ? price[0].replace(/,/g, '') : 'Unavailable',
                mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
                discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
                condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
                seller: row('a.a-size-small.a-link-normal').text().trim(),
                sellerID: sellerID,
                ASIN: asin,
                SellerListingLink:`https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
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
    }

    await browser.close();
}

async function runScraping() {
    for (let asin of asins) {
        await scrapeData(asin);
    }

    fs.writeFile('asin_results.json', JSON.stringify(results, null, 2), err => {
        if (err) console.log('Error writing file:', err);
        else console.log('Successfully written data to file');
    });
}

runScraping().catch(console.error);
