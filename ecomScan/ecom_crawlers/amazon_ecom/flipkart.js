
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const url = require('url');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;



const inputString = `
Burlington English Grammar: An Eclectic Approach Grade 1
Burlington English Grammar: An Eclectic Approach Grade 2
Burlington English Grammar: An Eclectic Approach Grade 3
Burlington English Grammar: An Eclectic Approach Grade 4
Burlington English Grammar: An Eclectic Approach Grade 5
Burlington English Grammar: An Eclectic Approach Grade 6
Burlington English Grammar: An Eclectic Approach Grade 7
Burlington English Grammar: An Eclectic Approach Grade 8
Burlington English Grammar for ICSE Schools Grade 1
Burlington English Grammar for ICSE Schools Grade 2
Burlington English Grammar for ICSE Schools Grade 3
Burlington English Grammar for ICSE Schools Grade 4
Burlington English Grammar for ICSE Schools Grade 5
Burlington English Grammar for ICSE Schools Grade 6
Burlington English Grammar for ICSE Schools Grade 7
Burlington English Grammar for ICSE Schools Grade 8
Burlington English Great Expectations Grade 6
Burlington English Tales of the Macabre Grade 6
Burlington English Romeo and Juliet Grade 6
Burlington English The Adventures of Huckleberry Finn
Burlington English The Ballad of Ron Wallis Grade 8
Burlington English The Canterville Ghost Grade 3
Burlington English The Elephant Man Grade 7
Burlington English The Haunted Hotel – A Mystery of Modern Venice Grade 8
Burlington English The Lost World
Burlington English The Murders in the Rue Morgue and other stories Grade 7
Burlington English The Picture of Dorian Gray Grade 5
Burlington English The Secret Garden Grade 3
Burlington English Tunnel to the Unknown Grade 5
Burlington English Uncle Tom’s Cabin Grade 8
Burlington English Wuthering Heights Grade 8
Burlington English A Christmas Carol Grade 4
Burlington English Tarzan and the Apes Grade 3
Burlington English The Curious Case of Benjamin Button Grade 6
Burlington English The Hunchback of Notre Dame Grade 8
Burlington English The Mayor of Casterbridge Grade 7
Burlington English The Prisoner of Zenda Grade 7
Burlington English The Importance of Being Earnest Grade 7
Burlington English Tsunami Grade 7
Burlington English Brewster’s Millions Grade 7
Burlington English A Refugee Story Grade 6
Burlington English Men of Their Time Grade 4
Burlington English The Life and Times of William Shakespeare Grade 8
Burlington English The Hound of the Baskervilles Grade 8
Burlington English The Living World Grade 3
Burlington English Villains Grade 6
Burlington English The Black Tulip Grade 8
Burlington English Three Tales of Terror and Mystery Grade 8
Burlington English Three Child Rulers Grade 5
Burlington English The House of Arden Grade 3
Burlington English Modern Masters Grade 6
Burlington English Agathon A Greek Slave in Pompeii Grade 3
Burlington English A Dangerous Game Grade 4
Burlington English Queen Arthur Grade 4
Burlington English A Stranger in the Past Grade 4
Burlington English A Convict’s Tale Grade 6
Burlington English Jump to Freedom Grade 4
Burlington English An Arctic Adventure Grade 4
Burlington English Grey Owl A Man of the Wilderness Grade 5
Burlington English Save the Titanic! Grade 5
Burlington English A Spy in Siberia Grade 5
Burlington English The Ghost Ship Grade 5
Burlington English The Case of the Ancient Artefact Grade 5
Burlington English The Ghost of Featherstone Castle Grade 5
Burlington English Extraordinary Women Grade 6
Burlington English Channel to the Future Grade 6
Burlington English Moonfleet Grade 7
Burlington English Jane Eyre Grade 7
Burlington English The Boxer Grade 8
Burlington English Emma Grade 8

`;
// Split the input string to create an array of product IDs
const keywords = inputString.split('\n').map(id => id.trim()).filter(id => id);

// const keywords = [ 
// //     "Oswaal Books",
// //     "Oswaal Objective", "Oswaal CDS",
// //     "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
// //     "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
// //     "oswal sample paper class 10 2024",
// //     "Oswaal One for All",

// // "Oswaal CUET",
// // "Oswaal NCERT",
// // "Oswaal JEE",
// // "Oswaal NTSE",
// // "Oswaal CBSE",
// // "Oswaal ICSE",
// // "Oswaal ISC",
// // "Oswaal NTA",
// // "Oswaal CAT",
// // "Oswaal RRB",
// // "Oswaal Handbook",
// // "Oswaal RMT",
// // "Oswaal UGC",
// // "Oswaal GATE"
   
// //   "C.krishniah chetty & sons ",
// //     "C.krishniah chetty Jewellers",
// //     "C.krishniah chetty & sons Manufactures",
// //     "C.krishniah chetty & sons",
// //     "C.krishniah chetty charitable Trust",
// //     "C.krishniah chetty Foundation",
// //     "C.krishniah chetty jewelleries",
// //     "ckc chains and jewellery",
// //     "ckc jewellery and product",
// //     "C.krishniah chetty jewelleries",
// //     "ckc chains and jewellery",

// // "C.krishniah chetty & sons",
// // "C.krishniah chetty Jewellers",
// // "C.krishniah chetty & sons Manufactures",
// // "C.krishniah chetty & sons",
// // "C.krishniah chetty charitable Trust",
// // "C.krishniah chetty Foundation",
// // "CKC JEWELLER",
// // "ckcjeweller",
// // "ckc sons",
// // "c.krishnah chetty",
// // "c.k.c. groups",
// // "jewel by CKC",
// // "ckc jwellery",
// // "ckc gold",
// // "ckc ornaments"

// "Applied Mathematics (Code-241), Class-XII",
// "Applied Mathematics, Class-XI",
// "Understanding ICSE Computer Applications with Blue J Class- X",
// "Understanding ICSE Mathematics Class- X",
// "ICSE Understanding Computer Applications with Blue J Class- IX",
// "Understanding ICSE Mathematics Class- IX",
// "Accountancy (Part-A) Vol-I, Class- XII + Volume 2",
// "Accountancy (Part-B) Vol-II, Class- XII",
// "Analysis of Financial Statements Class XII, Part-B (Including Project Work)",
// "New I.S.C. Accountancy (Volume I Partnership Accounts & Volume II Company Accounts & Analysis of Financial Statements) Class- XII",
// "New I.S.C. Accountancy Class- XI (Vol. I & II)",
// "Accountancy Class- XI"
// ]; // Add your keywords here

const csvFilePath = 'results.csv';
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        {id: 'title', title: 'Title'},
        {id: 'Isbn', title: 'ISBN'},
        {id: 'source', title: 'Source'},
        {id: 'cover', title: 'Cover'},
        {id: 'price', title: 'Price'},
        {id: 'mrp', title: 'MRP'},
        {id: 'discount', title: 'Discount'},
        {id: 'Format', title: 'Format'},
        {id: 'rating', title: 'Rating'}
    ],
    append: true // This will append to the file if it exists
});

// Function to write headers if the file does not exist
async function writeHeaders() {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: [
                {id: 'title', title: 'Title'},
                {id: 'Isbn', title: 'ISBN'},
                {id: 'source', title: 'Source'},
                {id: 'cover', title: 'Cover'},
                {id: 'price', title: 'Price'},
                {id: 'mrp', title: 'MRP'},
                {id: 'discount', title: 'Discount'},
                {id: 'Format', title: 'Format'},
                {id: 'rating', title: 'Rating'}
            ],
            append: false // This will write headers if the file does not exist
        });
        await csvWriterForHeaders.writeRecords([]); // Writing headers
    }
}

async function fetchAndExtract(key, browser) {
    const page = await browser.newPage();
    let allResults = [];

    for (let pageNum = 1; pageNum <= 8; pageNum++) { // Scraping up to 4 pages
        try {
            const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${pageNum}`;
            await page.goto(pageUrl, { waitUntil: 'networkidle2' });
            const body = await page.content();
            const results = extractData(body, pageNum, key);

            if (results.results.length === 0) {
                console.log(`No data found for ${key} on page ${pageNum}, breaking the loop.`);
                break; // If no data found, break the loop for this keyword
            }

            allResults.push(...results.results);

            // Save results incrementally
            await csvWriter.writeRecords(allResults);
            allResults = []; // Clear allResults for next page
        } catch (error) {
            console.error(`Error on page ${pageNum} for keyword '${key}': ${error}`);
            break; // Optional: Break on error or handle it differently
        }
    }

    await page.close();
}

function extractData(body, page, key) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };
    let organic_results = $('div.slAVV4');

    organic_results.each((i, elem) => {
        let row_selector = cheerio.load($(elem).html());
        var fullUrl = `https://www.flipkart.com${row_selector('a').first().attr('href')}`;
        var parsedUrl = new URL(fullUrl);
        var cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

        let serp_obj = {
            title: row_selector('a.wjcEIp').attr('title'),
            Isbn: parsedUrl.searchParams.get("pid"),
            source: cleanUrl,
            cover: row_selector('img.DByuf4').attr('src'),
            price: row_selector('.Nx9bqj').text().trim(),
            mrp: row_selector('.yRaY8j').text().trim(),
            discount: row_selector('.UkUFwK span').text().trim(),
            Format: row_selector('.NqpwHC').text().trim(), // Assuming this is the location for author
            rating: row_selector('.XQDdHH').text().trim(), // Assuming this fetches the rating
        };

        if (serp_obj.source) {
            results.results.push(serp_obj);
        }
    });

    results.state = 'NORMAL';
    results.results_length = results.results.length;
    return results;
}

async function scrapeKeywords(keywords) {
    let browser;
    try {
        browser = await puppeteer.launch();
        await writeHeaders(); // Ensure headers are written before scraping

        for (const key of keywords) {
            await fetchAndExtract(key, browser);
        }
    } catch (error) {
        console.error(`Encountered an error: ${error}. Attempting to use a proxy.`);
        // Here you would handle proxy logic and relaunch the browser if necessary
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    console.log('All data has been saved to results.csv.');
}

scrapeKeywords(keywords);


















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const url = require('url');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const keywords = [ 
//     "Advanced Bank Management",
//     "Bank Financial Management",
//     "Indian Economy &Indian Financial System",
//     "Principles &Practices of Banking",
//     "Accounting &Financial Management for Bankers",
//     "Retail Banking &Wealth Management",
//     "Banking Regulations &Business Laws",
//     "Advanced Business & Financial Management",
//     "macmillan caiib",
//     "macmillan jaiib",
//     "caiib books",
//     "jaiib books",
//     "Caiib resources",
//     "jaiib resources",
//     "caiib new syallabus",
//     "jaiib new syallabus"
// ]; // Add your keywords here

// const csvWriter = createCsvWriter({
//     path: 'results.csv',
//     header: [
//         {id: 'title', title: 'Title'},
//         {id: 'Isbn', title: 'ISBN'},
//         {id: 'source', title: 'Source'},
//         {id: 'cover', title: 'Cover'},
//         {id: 'price', title: 'Price'},
//         {id: 'mrp', title: 'MRP'},
//         {id: 'discount', title: 'Discount'},
//         {id: 'Format', title: 'Format'},
//         {id: 'rating', title: 'Rating'}
//     ],
//     append: true // This will append to the file if it exists
// });

// async function fetchAndExtract(key, browser) {
//     const page = await browser.newPage();
//     let allResults = [];

//     for (let pageNum = 1; pageNum <= 4; pageNum++) { // Scraping up to 4 pages
//         try {
//             const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${pageNum}`;
//             await page.goto(pageUrl, { waitUntil: 'networkidle2' });
//             const body = await page.content();
//             const results = extractData(body, pageNum, key);

//             if (results.results.length === 0) {
//                 console.log(`No data found for ${key} on page ${pageNum}, breaking the loop.`);
//                 break; // If no data found, break the loop for this keyword
//             }

//             allResults.push(...results.results);

//             // Save results incrementally
//             await csvWriter.writeRecords(allResults);
//             allResults = []; // Clear allResults for next page
//         } catch (error) {
//             console.error(`Error on page ${pageNum} for keyword '${key}': ${error}`);
//             break; // Optional: Break on error or handle it differently
//         }
//     }

//     await page.close();
// }

// function extractData(body, page, key) {
//     let $ = cheerio.load(body);
//     let results = { state: '', results: [] };
//     let organic_results = $('div.slAVV4');

//     organic_results.each((i, elem) => {
//         let row_selector = cheerio.load($(elem).html());
//         var fullUrl = `https://www.flipkart.com${row_selector('a').first().attr('href')}`;
//         var parsedUrl = new URL(fullUrl);
//         var cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

//         let serp_obj = {
//             title: row_selector('a.wjcEIp').attr('title'),
//             Isbn: parsedUrl.searchParams.get("pid"),
//             source: cleanUrl,
//             cover: row_selector('img.DByuf4').attr('src'),
//             price: row_selector('.Nx9bqj').text().trim(),
//             mrp: row_selector('.yRaY8j').text().trim(),
//             discount: row_selector('.UkUFwK span').text().trim(),
//             Format: row_selector('.NqpwHC').text().trim(), // Assuming this is the location for author
//             rating: row_selector('.XQDdHH').text().trim(), // Assuming this fetches the rating
//         };

//         if (serp_obj.source) {
//             results.results.push(serp_obj);
//         }
//     });

//     results.state = 'NORMAL';
//     results.results_length = results.results.length;
//     return results;
// }

// async function scrapeKeywords(keywords) {
//     let browser;
//     try {
//         browser = await puppeteer.launch();
//         // Write headers to the CSV file if it does not exist
//         if (!fs.existsSync('results.csv')) {
//             await csvWriter.writeRecords([]);
//         }

//         for (const key of keywords) {
//             await fetchAndExtract(key, browser);
//         }
//     } catch (error) {
//         console.error(`Encountered an error: ${error}. Attempting to use a proxy.`);
//         // Here you would handle proxy logic and relaunch the browser if necessary
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
//     console.log('All data has been saved to results.csv.');
// }

// scrapeKeywords(keywords);









// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const url = require('url');

// const keywords = [ 
    
  
//     // "Advanced Bank Management",
//     // "Bank Financial Management",
//     // "Indian Economy &Indian Financial System",
//     // "Principles &Practices of Banking",
//     // "Accounting &Financial Management for Bankers",
//     // "Retail Banking &Wealth Management",
//     // "Banking Regulations &Business Laws",
//     // "Advanced Business & Financial Management",
//     // "macmillan caiib",
//     "macmillan jaiib",
//     "caiib books",
//     "jaiib books",
//     "Caiib resources",
//     "jaiib resources",
//     "caiib new syallabus",
//     "jaiib new syallabus"


    // "9788119896028",
    // "9788119896196",
    // "9788177586466",
    // "9789357051484",
    // "9788119847839",
    // "9788119847136",
    // "9789353439453",
    // "9789356065765",
    // "9788119847099",
    // "9789356065819",
    // "9789353949600",
    // "9788119847969",
    // "9789332558540",
    // "9789332568716",
    // "9789356063570",
    // "9789354498299",
    // "9789356062665",
    // "9789357051460",
    // "9789332549449",
    // "9788119847143"


//     // "Oswaal Books"
//         // "Oswaal Objective", "Oswaal CDS",
//         // "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
//         // "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
//         // "oswal sample paper class 10 2024",
//         // "Oswaal One for All",
//         // "Oswaal CUET",
//         // "Oswaal NCERT",
//         // "Oswaal JEE",
//         // "Oswaal NTSE",
//         // "Oswaal CBSE",
//         // "Oswaal ICSE",
//         // "Oswaal ISC",
//         // "Oswaal NTA",
//         // "Oswaal CAT",
//         // "Oswaal RRB",
//         // "Oswaal Handbook",
//         // "Oswaal RMT",
//         // "Oswaal UGC",
//         // "Oswaal GATE"
// ]; // Add your keywords here

// async function fetchAndExtract(key, browser) {
//     const page = await browser.newPage();
//     let allResults = [];

//     for (let pageNum = 1; pageNum <= 4; pageNum++) { // Scraping up to 10 pages
//         try {
//             const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${pageNum}`;
//             await page.goto(pageUrl, { waitUntil: 'networkidle2' });
//             const body = await page.content();
//             const results = extractData(body, pageNum, key);

//             if (results.results.length === 0) {
//                 console.log(`No data found for ${key} on page ${pageNum}, breaking the loop.`);
//                 break; // If no data found, break the loop for this keyword
//             }

//             allResults.push(...results.results);

//             // Save results incrementally
//             let currentData = fs.existsSync('results.json') ? JSON.parse(fs.readFileSync('results.json')) : [];
//             currentData.push(...allResults);
//             fs.writeFileSync('results.json', JSON.stringify(currentData, null, 2));
//             allResults = []; // Clear allResults for next page
//         } catch (error) {
//             console.error(`Error on page ${pageNum} for keyword '${key}': ${error}`);
//             break; // Optional: Break on error or handle it differently
//         }
//     }

//     await page.close();
// }

// function extractData(body, page, key) {
//     let $ = cheerio.load(body);
//     let results = { state: '', results: [] };
//     let organic_results = $('div.slAVV4');

//     organic_results.each((i, elem) => {
//         let row_selector = cheerio.load($(elem).html());
//         var fullUrl = `https://www.flipkart.com${row_selector('a').first().attr('href')}`;
//         var parsedUrl = new URL(fullUrl);
//         var cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

//         let serp_obj = {
//             title: row_selector('a.wjcEIp').attr('title'),
//             Isbn: parsedUrl.searchParams.get("pid"),
//             source: cleanUrl,
//             cover: row_selector('img.DByuf4').attr('src'),
//             price: row_selector('.Nx9bqj').text().trim(),
//             mrp: row_selector('.yRaY8j').text().trim(),
//             discount: row_selector('.UkUFwK span').text().trim(),
//             Format: row_selector('.NqpwHC').text().trim(), // Assuming this is the location for author
//             rating: row_selector('.XQDdHH').text().trim(), // Assuming this fetches the rating
//         };

//         if (serp_obj.source) {
//             results.results.push(serp_obj);
//         }
//     });

//     results.state = 'NORMAL';
//     results.results_length = results.results.length;
//     return results;
// }

// async function scrapeKeywords(keywords) {
//     let browser;
//     try {
//         browser = await puppeteer.launch();
//         for (const key of keywords) {
//             await fetchAndExtract(key, browser);
//         }
//     } catch (error) {
//         console.error(`Encountered an error: ${error}. Attempting to use a proxy.`);
//         // Here you would handle proxy logic and relaunch the browser if necessary
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
//     console.log('All data has been saved to results.json.');
// }

// scrapeKeywords(keywords);
