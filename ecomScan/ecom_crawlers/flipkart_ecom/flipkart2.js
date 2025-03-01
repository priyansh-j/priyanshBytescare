
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const url = require('url');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputString = `
Adhunik Hindi Vyakaran Aur Rachna
Basic Science for Class 6
Basic Science for Class 7
Basic Science for Class 8
Foundation Science: Physics for Class 9
Foundation Science: Physics for Class 10
Ganit Parichay 1
Ganit Parichay 2
Ganit Parichay 3
Ganit Parichay 4
Ganit Parichay 5
Hindi Reader 0
Hindi Reader 1
Hindi Reader 2
Hindi Reader 3
Hindi Reader 4
Hindi Reader 5
Junior Maths 1
Junior Maths 2
Junior Maths 3
Junior Maths 4
Math Steps 1
Math Steps 2
Math Steps 3
Math Steps 4
Math Steps 5
Mathematics for Class 6
Mathematics for Class 7
Mathematics for Class 8
Mathematics for Olympiads and Talent Search Competitions for Class 6
Mathematics for Olympiads and Talent Search Competitions for Class 7
Mathematics for Olympiads and Talent Search Competitions for Class 8
My Grammar Time 1
My Grammar Time 2
My Grammar Time 3
My Grammar Time 4
My Grammar Time 5
Our World: Then and Now 1
Our World: Then and Now 2
Our World: Then and Now 3
Sanskrit Bharati 1
Sanskrit Bharati 2
Sanskrit Bharati 3
Sanskrit Bharati 4
Saral Hindi Vyakaran Aur Rachna
Secondary School Mathematics for Class 9
Secondary School Mathematics for Class 10
Senior Secondary School Mathematics for Class 11
Senior Secondary School Mathematics for Class 12
Sugam Sanskrit Vyakaran 1
Sugam Sanskrit Vyakaran 2
The Magic Carpet 1
The Magic Carpet 2
The Magic Carpet 3
The Magic Carpet 4
The Magic Carpet 5
The Magic Carpet 6
The Magic Carpet 7
The Magic Carpet 8
Concepts of Physics 1
Concepts of Physics 2
Modern Approach to Chemical Calculations
Bhoutiki ki Samajh 1
Reactions, Rearrangements and Reagents
Physics MCQ
Chemistry MCQ
Mathematics MCQ
Problems Plus in IIT Mathematics
Organic Chemistry Volume 1: Chemistry of Organic Compounds
High School Bhoutiki 1
High School Bhoutiki 2
High School Rasayanshastra 1
High School Rasayanshastra 2
High School Jeevvigyan 1
High School Jeevvigyan 2
High School Prathmik Ganit 1
High School Prathmik Ganit 2
Sugam Ganit 1,2,3
Sugam Vigyan 1,2,3
h c verma
r s aggarwal
Mathematics rs aggarwal
concept of physics

`;

const keywords = inputString.split('\n').map(id => id.trim()).filter(id => id);

const csvFilePath = 'resultsbb.csv';
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

    for (let pageNum = 1; pageNum <= 5; pageNum++) { // Scraping up to 4 pages
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
        browser = await puppeteer.launch({headless:false});
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


//     // "9788119896028",
//     // "9788119896196",
//     // "9788177586466",
//     // "9789357051484",
//     // "9788119847839",
//     // "9788119847136",
//     // "9789353439453",
//     // "9789356065765",
//     // "9788119847099",
//     // "9789356065819",
//     // "9789353949600",
//     // "9788119847969",
//     // "9789332558540",
//     // "9789332568716",
//     // "9789356063570",
//     // "9789354498299",
//     // "9789356062665",
//     // "9789357051460",
//     // "9789332549449",
//     // "9788119847143"


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
