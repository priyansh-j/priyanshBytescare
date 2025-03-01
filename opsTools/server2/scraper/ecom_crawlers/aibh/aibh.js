const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs'); // Require fs module to handle file operations

// Array of keywords to search
const keywords = [
    "9789389335408",
    "9789395736480",
    "9789393553263",
    "9789390612734",
    "9789390612864",
    "9789390612475",
    "9789389335996",
    "9789393553447",
    "9789390612536",
    "9789389859737",
    "9789393553430",
    "9789395736404",
    "9789393553287",
    "9789389859409",
    "9789389859379",
    "9789393553379",
    "9789389859362",
    "9789389702651",
    "9789389859812",
    "9789393553362",
    "9789390612581",
    "9788119666768",
    "9789395736527",
    "9789393553454",
    "9789389335309",
    "9789389859034",
    "9789390612857",
    "9789389859621",
    "9789390612956",
    "9789387963818",
    "9789388696159",
    "9789389859751",
    "9788194864547",
    "9789389859188",
    "9789393553294",
    "9789389859768",
    "9789395736503",
    "9789395736473",
    "9789351297222",
    "9789389859638",
    "9789389859539",
    "9788194864530",
    "9789395736459",
    "9789395736510",
    "9789395736497",
    "9789389859928",
    "9789393553188",
    "9789393553270",
    "9789351296591",
    "9789390612185",
    "9789388313384",
    "9789390612451",
    "9789393553591",
    "9789389859782",
    "9788119461158",
    "9788197042591",
    "9789389335866",
    "9789389859577",
    "9789395736367",
    "9789395736572",
    "9788119461981",
    "9789395736800",
    "9788119461134",
    "9789390612109",
    "9789393553355",
    "9789393553300",
    "9789389859423",
    "9788119877775",
    "9788119666720",
    "9789395736435",
    "9789395736411",
    "9789351296829",
    "9789390612925",
    "9789395736374",
    "9789386691095",
    "9789395736442",
    "9789395736558",
    "9789393553225",
    "9789388696432",
    "9789390612970",
    "9788184733235",
    "9789395736398",
    "9789395736565",
    "9789351292494",
    "9789395736534",
    "9789395736541",
    "9789395736381",
    "9788197042584",
    "9789390612024",
    "9788119666799",
    "9789393553751",
    "9789351291305",
    "9789387506640",
    "9789387506657",
    "9789351293804",
    "9789393553492",
    "9789390612659",
    "9789389859911",
    "9789395736206"
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
                Img: row_selector('img.product-image__img').attr('src'),
                author: row_selector('span.author-title > a').first().text().trim(), // Extracting author information
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
    
    // "9789389335408",
    // "9789395736480",
    // "9789393553263",
    // "9789390612734",
    // "9789390612864",
    // "9789390612475",
    // "9789389335996",
    // "9789393553447",
    // "9789390612536",
    // "9789389859737",
    // "9789393553430",
    // "9789395736404",
    // "9789393553287",
    // "9789389859409",
    // "9789389859379",
    // "9789393553379",
    // "9789389859362",
    // "9789389702651",
    // "9789389859812",
    // "9789393553362",
    // "9789390612581",
    // "9788119666768",
    // "9789395736527",
    // "9789393553454",
    // "9789389335309",
    // "9789389859034",
    // "9789390612857",
    // "9789389859621",
    // "9789390612956",
    // "9789387963818",
    // "9789388696159",
    // "9789389859751",
    // "9788194864547",
    // "9789389859188",
    // "9789393553294",
    // "9789389859768",
    // "9789395736503",
    // "9789395736473",
    // "9789351297222",
    // "9789389859638",
    // "9789389859539",
    // "9788194864530",
    // "9789395736459",
    // "9789395736510",
    // "9789395736497",
    // "9789389859928",
    // "9789393553188",
    // "9789393553270",
    // "9789351296591",
    // "9789390612185",
    // "9789388313384",
    // "9789390612451",
    // "9789393553591",
    // "9789389859782",
    // "9788119461158",
    // "9788197042591",
    // "9789389335866",
    // "9789389859577",
    // "9789395736367",
    // "9789395736572",
    // "9788119461981",
    // "9789395736800",
    // "9788119461134",
    // "9789390612109",
    // "9789393553355",
    // "9789393553300",
    // "9789389859423",
    // "9788119877775",
    // "9788119666720",
    // "9789395736435",
    // "9789395736411",
    // "9789351296829",
    // "9789390612925",
    // "9789395736374",
    // "9789386691095",
    // "9789395736442",
    // "9789395736558",
    // "9789393553225",
    // "9789388696432",
    // "9789390612970",
    // "9788184733235",
    // "9789395736398",
    // "9789395736565",
    // "9789351292494",
    // "9789395736534",
    // "9789395736541",
    // "9789395736381",
    // "9788197042584",
    // "9789390612024",
    // "9788119666799",
    // "9789393553751",
    // "9789351291305",
    // "9789387506640",
    // "9789387506657",
    // "9789351293804",
    // "9789393553492",
    // "9789390612659",
    // "9789389859911",
    // "9789395736206"


// ];

// (async () => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Open a write stream to a file
//     const stream = fs.createWriteStream('results.json', { flags: 'a' });

//     // Write an opening bracket for the JSON array at the start of the file
//     stream.write('[\n');

//     for (const [index, key] of keywords.entries()) {
//         const url = `https://www.aibh.in/search-products?search=${key}`;
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         const body = await page.content();
//         const $ = cheerio.load(body);
//         let results = [];

//         // Check for CAPTCHA
//         let block_text = $('div#infoDiv').text();
//         if (block_text.includes('solve the CAPTCHA if you are using advanced terms that robots are known to use')) {
//             results.state = 'CAPTCHA_DETECTED';
//             stream.write(JSON.stringify(results, null, 2));
//             continue;
//         }

//         let no_results = $('.card-section > div > b');
//         if (no_results.length > 0) {
//             results.state = 'NO_ACCURATE';
//             stream.write(JSON.stringify(results, null, 2));
//             continue;
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
//                 results.push(serp_obj);
//             }
//         });

//         // results.state = 'NORMAL';
//         // results.results_length = results.results.length;
        
//         // Write results to the file
//         stream.write(JSON.stringify(results, null, 2));
//         if (index < keywords.length - 1) {
//             stream.write(',\n');
//         }
//     }

//     // Write a closing bracket for the JSON array at the end of the file
//     stream.write('\n]');
//     stream.end();

//     await browser.close();
// })();







// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// // Array of keywords to search
// const keywords = ['9789389335408'];

// (async () => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     for (const key of keywords) {
//         const url = `https://www.aibh.in/search-products?search=${key}`;
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         // Wait for necessary elements to load if needed
//         // await page.waitForSelector('div.products-list__body');

//         const body = await page.content();
//         const $ = cheerio.load(body);
//         let results = { state: '', results: [] };

//         // Check for CAPTCHA
//         let block_text = $('div#infoDiv').text();
//         if (block_text.includes('solve the CAPTCHA if you are using advanced terms that robots are known to use')) {
//             results.state = 'CAPTCHA_DETECTED';
//             console.log(results);
//             continue;
//         }

//         let no_results = $('.card-section > div > b');
//         if (no_results.length > 0) {
//             results.state = 'NO_ACCURATE';
//             console.log(results);
//             continue;
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
//                 results.results.push(serp_obj);
//             }
//         });

//         results.state = 'NORMAL';
//         results.results_length = results.results.length;
//         console.log(results);
//     }

//     await browser.close();
// })();
