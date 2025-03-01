const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define the input string with product IDs
const inputString = `
9788197239885
9789391065034
9788197239823
9788197482106
9789391065232
9788197796166
9788197482168
9788197239878
9788197482199
9788197883460
9788197515798
9788197515743
9789391065683
9788197796173
9788197515781
9788197796197
9788197515705
9789391065881
9788197482144
9788197883477
9788197239854
9788193040591
9788197239809
9788197515729
9788197780950
9788197515736
9788197883408
9788197482137
9788197515774
9789391065911
9788197482120
9788197239830
9789391065980
9789391065775
9788197482175
9788197482151
9788197534843
9789384934019
9788197239847
9789391065966
9789391065751
9789384934811
9789391065836
9788197796180
9789391065409
9788197796128
9788197482182
9788197515712
9788197515767
9788197239892
9788197515750
9788197534867

`;

// Split the input string to create an array of product IDs
const productIDs = inputString.split('\n').map(id => id.trim()).filter(id => id);

const csvFilePath = 'seller_results.csv';
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        {id: 'seller', title: 'Seller'},
        {id: 'rating', title: 'Rating'},
        {id: 'price', title: 'Price'},
        {id: 'mrp', title: 'MRP'},
        {id: 'discount', title: 'Discount'},
        {id: 'isbn', title: 'ISBN'}
    ],
    append: true // Append to the file if it exists
});

// Function to write headers if the file does not exist
async function writeHeaders() {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: [
                {id: 'seller', title: 'Seller'},
                {id: 'rating', title: 'Rating'},
                {id: 'price', title: 'Price'},
                {id: 'mrp', title: 'MRP'},
                {id: 'discount', title: 'Discount'},
                {id: 'isbn', title: 'ISBN'}
            ],
            append: false // Write headers if the file does not exist
        });
        await csvWriterForHeaders.writeRecords([]); // Writing headers
    }
}

async function fetchAndExtract(browser, key) {
    let page;
    try {
        page = await browser.newPage();
        const pageUrl = `https://www.flipkart.com/sellers?pid=${key}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const body = await page.content();
        const results = extractData(body, key);
        await appendResultsToFile(results);
        return results;
    } catch (error) {
        console.error(`Error processing ISBN ${key}: ${error}`);
        logError(key, error);
        return [];  // Return empty results in case of error
    } finally {
        if (page) await page.close();  // Ensure the page is always closed
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

async function appendResultsToFile(results) {
    await csvWriter.writeRecords(results);
    console.log(`Results for ${results.length ? results[0].isbn : 'No ISBN'} saved to file.`);
}

function logError(key, error) {
    let existingErrors = [];
    if (fs.existsSync('error_isbn.json')) {
        existingErrors = JSON.parse(fs.readFileSync('error_isbn.json'));
    }
    existingErrors.push({isbn: key, error: error.message});
    fs.writeFileSync('error_isbn.json', JSON.stringify(existingErrors, null, 2));
    console.log(`Error for ISBN: ${key} logged to file.`);
}

async function scrapeProductIDs(productIDs) {
    const browser = await puppeteer.launch();
    try {
        await writeHeaders(); // Ensure headers are written before scraping

        for (const key of productIDs) {
            await fetchAndExtract(browser, key);
            console.log(`Data for ISBN: ${key} has been processed and saved.`);
        }
    } catch (error) {
        console.error(`An error occurred during scraping: ${error}`);
    } finally {
        await browser.close();
        console.log('All data processing complete.');
    }
}

scrapeProductIDs(productIDs);

















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const productIDs = [

//    "RBKFT38VWWVGWZD6",
//   "RBKF9EW5QQBEHPBE"


// ];

// async function fetchAndExtract(browser, key) {
//     let page;
//     try {
//         page = await browser.newPage();
//         const pageUrl = `https://www.flipkart.com/sellers?pid=${key}`;
//         //console.log(`Navigating to ${pageUrl}`);
//         await page.goto(pageUrl, { waitUntil: 'networkidle2' });
//         const body = await page.content();
//         const results = extractData(body, key);
//        // console.log(`Data extracted for ISBN: ${key}`);
//         appendResultsToFile(results);
//         return results;
//     } catch (error) {
//         console.error(`Error processing ISBN ${key}: ${error}`);
//         logError(key, error);
//         return [];  // Return empty results in case of error
//     } finally {
//         if (page) await page.close();  // Ensure the page is always closed
//     }
// }

// function extractData(body, key) {
//     let $ = cheerio.load(body);
//     let results = [];
//     let organic_results = $('div.UQFoop');

//     organic_results.each((i, elem) => {
//         let row = cheerio.load($(elem).html());
//         let serp_obj = {
//             seller: row('div.EElWwG span').text().trim(),
//             rating: row('div.XQDdHH').text().trim(),
//             price: row('div.Nx9bqj').text().trim(),
//             mrp: row('div.yRaY8j').text().trim(),
//             discount: row('div.UkUFwK span').text().trim(),
//             isbn: key
//         };

//         if (serp_obj.seller) {
//             results.push(serp_obj);
//         }
//     });

//     console.log(`Found ${results.length} results for ISBN: ${key}`);
//     return results;
// }

// function appendResultsToFile(results) {
//     let existingData = [];
//     if (fs.existsSync('seller_results.json')) {
//         existingData = JSON.parse(fs.readFileSync('seller_results.json'));
//     }
//     existingData.push(...results);
//     fs.writeFileSync('seller_results.json', JSON.stringify(existingData, null, 2));
//     console.log(`Results for ${results.length ? results[0].isbn : 'No ISBN'} saved to file.`);
// }

// function logError(key, error) {
//     let existingErrors = [];
//     if (fs.existsSync('error_isbn.json')) {
//         existingErrors = JSON.parse(fs.readFileSync('error_isbn.json'));
//     }
//     existingErrors.push({isbn: key});
//     fs.writeFileSync('error_isbn.json', JSON.stringify(existingErrors, null, 2));
//     console.log(`Error for ISBN: ${key} logged to file.`);
// }

// async function scrapeProductIDs(productIDs) {
//     const browser = await puppeteer.launch();
//     try {
//         for (const key of productIDs) {
//             await fetchAndExtract(browser, key);
//             console.log(`Data for ISBN: ${key} has been processed and saved.`);
//         }
//     } catch (error) {
//         console.error(`An error occurred during scraping: ${error}`);
//     } finally {
//         await browser.close();
//         console.log('All data processing complete.');
//     }
// }

// scrapeProductIDs(productIDs);












// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const productIDs = [
//     "RBKFT38VWWVGWZD6",
//     "RBKF9EW5QQBEHPBE",
//     "RBKG2BN2AHHE9QHJ",
//     "RBKFU9BYNGAYBHGA",
//     "RBKGF2CG7NMHGJRN"
// ];

// async function fetchAndExtract(key) {
//     try {
//         const pageUrl = `https://www.flipkart.com/sellers?pid=${key}`;
//         console.log(`Fetching data from ${pageUrl}`);
//        // const response = await axios.get(pageUrl);
//        const response = await axios.get(pageUrl, {
//         headers: { 
//             'Cookie': 'K-ACTION=null; S=d1t10Pz8/P3Y8V0M/YD9iLXt/DAQ0uz6JO/4eFOKXAgiNUDedpwrsqdPyAeKcSz1UYhsP6ZyadrvdLIhl8FqmVJgsLg==; SN=VI2439937CC05D41C393BBA2168BF6486C.TOK67F8727D350C49B8AA96A9116A9A452B.1716875562.LO; T=TI171534271726400183165858184780916221300396524652112049980957740416; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ2Yjk5NDViLWZmYTEtNGQ5ZC1iZDQyLTFkN2RmZTU4ZGNmYSJ9.eyJleHAiOjE3MTg2MDM0NzcsImlhdCI6MTcxNjg3NTQ3NywiaXNzIjoia2V2bGFyIiwianRpIjoiYzQyZTIwOTItNGRhYy00YjVjLTg5YTQtMWExNzQ2YWFmOTA0IiwidHlwZSI6IkFUIiwiZElkIjoiVEkxNzE1MzQyNzE3MjY0MDAxODMxNjU4NTgxODQ3ODA5MTYyMjEzMDAzOTY1MjQ2NTIxMTIwNDk5ODA5NTc3NDA0MTYiLCJrZXZJZCI6IlZJMjQzOTkzN0NDMDVENDFDMzkzQkJBMjE2OEJGNjQ4NkMiLCJ0SWQiOiJtYXBpIiwidnMiOiJMTyIsInoiOiJIWUQiLCJtIjp0cnVlLCJnZW4iOjR9.S8-mO6A3Tc7XK5NKiQQwGeGMibxEqs6aZi1m7yd_rPg; rt=null; ud=8.H-ln8QiRdJI2Sd_6H6Ww6mCGs5k2lJvvabgQRdssG5321-ouTQpXVTW2mrutYyTqIrOy6X9zTCAaFhCdoTqh6bfz-Q8aN3578vb8IX8wm5GXKkYCWZhue6NifrIuka-n0xjVugA7qoyY-PGikqMDOA; vd=VI6C799AFDB4A2489988F81FE072C6FF5F-1706974328612-72.1716875477.1716875477.161546289'
//           }
//         });
//         const body = response.data;
//         const results = extractData(body, key);
//         console.log(`Data extracted for ISBN: ${key}`);
//         appendResultsToFile(results);
//         return results;
//     } catch (error) {
//         console.error(`Error processing ISBN ${key}: ${error}`);
//         return [];  // Return empty results in case of error
//     }
// }

// function extractData(body, key) {
//     let $ = cheerio.load(body);
//     let results = [];
//     let organic_results = $('div.UQFoop');

//     organic_results.each((i, elem) => {
//         let row = cheerio.load($(elem).html());
//         let serp_obj = {
//             seller: row('div.EElWwG span').text().trim(),
//             rating: row('div.XQDdHH').text().trim(),
//             price: row('div.Nx9bqj').text().trim(),
//             mrp: row('div.yRaY8j').text().trim(),
//             discount: row('div.UkUFwK span').text().trim(),
//             isbn: key
//         };

//         if (serp_obj.seller) {
//             results.push(serp_obj);
//         }
//     });

//     console.log(`Found ${results.length} results for ISBN: ${key}`);
//     return results;
// }

// function appendResultsToFile(results) {
//     let existingData = [];
//     if (fs.existsSync('seller_results.json')) {
//         existingData = JSON.parse(fs.readFileSync('seller_results.json'));
//     }
//     existingData.push(...results);
//     fs.writeFileSync('seller_results.json', JSON.stringify(existingData, null, 2));
//     console.log(`Results for ${results.length ? results[0].isbn : 'No ISBN'} saved to file.`);
// }

// async function scrapeProductIDs(productIDs) {
//     try {
//         for (const key of productIDs) {
//             await fetchAndExtract(key);
//             console.log(`Data for ISBN: ${key} has been processed and saved.`);
//         }
//     } catch (error) {
//         console.error(`An error occurred during scraping: ${error}`);
//     } finally {
//         console.log('All data processing complete.');
//     }
// }

// scrapeProductIDs(productIDs);
