const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define the input string with product IDs
const inputString = `
9789351276197
9789390411863
9789390411849
9789390411788
9789354631634
9789354635854
9789354632495
9789354239601
9789354239656
9789355958914
9789355958938
9789355958945
9789390411702
9789356340039
9789356345591
9789357286848
9789357287036
9789357287067
9789357287012
9789357287050
9789357287333
9789357287487
9789357287449
9789357287456
9789357287357
9789357287326
9789357287340
9789357287364
9789359585055
9789359580562
9789359585369
9789359587585
9789359584812
9789359584690
9789359587233
9789359583914
9789359585291
9789359581347
9789357287425
9789357287463
9789357287418
9789357287371
9789357287401
9789357287388
9789357287395
9789359581613
9789359589732
9789359585956
9789359587820
9789359585208
9789359589374
9789359585840
9789359586717
9789359581569
9789359583013
9789359587936
9789359582030
9789359587813
9789359583877
9789359581729
9789359585413
9789359580548
9789357283335
9789357280907
9789357282543
9789362395733
9789359584256
9789359583778
9789359586458
9789359589596
9789359581972
9789359587264
9789359584751
9789359585437
9789359585567
9789359587493
9789359586175
9789359586465
9789359580487
9789359583570
9789359585123
9789359586816
9789359582986
9789359580067
9789359588247
9789359582641
9789362395658
9789362399311
9789362396228
9789362393432
9789362391919
9789362393623
9789362397010
9789362399489
9789362396235
9789362396662
9789357287630
9789357287623
9789357287654
9789357287678
9789357287609
9789357287685
9789357287647
9789357287692
9789357287661
9789357287715
9789357287616
9789357287708
9789351277385
9789351277361
9789351277415
9789351277392
9789351277446
9789351277422
9789351277439
9789359582269
9789357287722
9789357287739
9789357287746
9789357287753
9789357287760
9789357287777
9789357287784
9789357287791
9789357287807
9789357287814
9789357287821
9789357287838
9789357287845
9789357287852
9789357287869
9789357287876
9789357288767
9789357282390
9789362396563
9789357283380
9789362398734
9789362398383
9789357289023
9789362396242
9789362392879
9789362394118
9789362395238
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
        throw error; // Re-throw error to be handled by the caller
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
   // console.log(`Results for ${results.length ? results[0].isbn : 'No ISBN'} saved to file.`);
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
    await writeHeaders(); // Ensure headers are written before scraping

    let browser = await puppeteer.launch();

    for (const key of productIDs) {
        try {
            await fetchAndExtract(browser, key);
            //console.log(`Data for ISBN: ${key} has been processed and saved.`);
        } catch (error) {
            console.error(`Restarting browser due to error with ISBN ${key}: ${error}`);
            await browser.close();
            browser = await puppeteer.launch();
        }
    }

    await browser.close();
    console.log('All data processing complete.');
}

scrapeProductIDs(productIDs);
















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// // Define the input string with product IDs
// const inputString = `

// 9788119896028
// 9788119896196
// 9788177586466
// 9788129703996
// 9789357051484
// 9788119847839
// 9788119847136
// 9789353439453
// 9789356065765
// 9788119847099
// 9789356065819
// 9789353949600
// 9788119847969
// 9789332558540
// 9789332568716
// 9789356063570
// 9789354498299
// 9789356062665
// 9789357051460
// 9789332549449
// 9788119847143

// `;

// // Split the input string to create an array of product IDs
// const productIDs = inputString.split('\n').map(id => id.trim()).filter(id => id);

// const csvFilePath = 'seller_results.csv';
// const csvWriter = createCsvWriter({
//     path: csvFilePath,
//     header: [
//         {id: 'seller', title: 'Seller'},
//         {id: 'rating', title: 'Rating'},
//         {id: 'price', title: 'Price'},
//         {id: 'mrp', title: 'MRP'},
//         {id: 'discount', title: 'Discount'},
//         {id: 'isbn', title: 'ISBN'}
//     ],
//     append: true // Append to the file if it exists
// });

// // Function to write headers if the file does not exist
// async function writeHeaders() {
//     if (!fs.existsSync(csvFilePath)) {
//         const csvWriterForHeaders = createCsvWriter({
//             path: csvFilePath,
//             header: [
//                 {id: 'seller', title: 'Seller'},
//                 {id: 'rating', title: 'Rating'},
//                 {id: 'price', title: 'Price'},
//                 {id: 'mrp', title: 'MRP'},
//                 {id: 'discount', title: 'Discount'},
//                 {id: 'isbn', title: 'ISBN'}
//             ],
//             append: false // Write headers if the file does not exist
//         });
//         await csvWriterForHeaders.writeRecords([]); // Writing headers
//     }
// }

// async function fetchAndExtract(browser, key) {
//     let page;
//     try {
//         page = await browser.newPage();
//         const pageUrl = `https://www.flipkart.com/sellers?pid=${key}`;
//         await page.goto(pageUrl, { waitUntil: 'networkidle2' });
//         const body = await page.content();
//         const results = extractData(body, key);
//         await appendResultsToFile(results);
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

// async function appendResultsToFile(results) {
//     await csvWriter.writeRecords(results);
//     console.log(`Results for ${results.length ? results[0].isbn : 'No ISBN'} saved to file.`);
// }

// function logError(key, error) {
//     let existingErrors = [];
//     if (fs.existsSync('error_isbn.json')) {
//         existingErrors = JSON.parse(fs.readFileSync('error_isbn.json'));
//     }
//     existingErrors.push({isbn: key, error: error.message});
//     fs.writeFileSync('error_isbn.json', JSON.stringify(existingErrors, null, 2));
//     console.log(`Error for ISBN: ${key} logged to file.`);
// }

// async function scrapeProductIDs(productIDs) {
//     const browser = await puppeteer.launch();
//     try {
//         await writeHeaders(); // Ensure headers are written before scraping

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
