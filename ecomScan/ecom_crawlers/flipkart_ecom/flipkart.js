const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const url = require('url');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const PageNumber =25;


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

const csvFilePath = 'results.csv';
const errorFilePath = 'error_isbn.json';

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

function logError(isbn, error) {
    let errors = [];

    if (fs.existsSync(errorFilePath)) {
        const fileContent = fs.readFileSync(errorFilePath);
        errors = JSON.parse(fileContent);
    }

    errors.push({ isbn, status: 'error', error: error.message });

    fs.writeFileSync(errorFilePath, JSON.stringify(errors, null, 2));
}

async function fetchAndExtract(key, browser) {
    const page = await browser.newPage();
    let allResults = [];

    for (let pageNum = 1; pageNum <= PageNumber; pageNum++) { // Scraping up to 25 pages
        try {
            const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${pageNum}`;
            //const pageUrl = `https://www.flipkart.com/search?q=${key}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&page=${pageNum}`;
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
            logError(key, error);
            throw error; // Rethrow error to handle browser restart
        }
    }

    await page.close();
}

function extractData(body, page, key) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };
    //let organic_results = $('div.slAVV4');
    let organic_results = $('div._75n1fW');
    //console.log(organic_results.length());

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
        browser = await puppeteer.launch({headless:true});
        await writeHeaders(); // Ensure headers are written before scraping

        for (const key of keywords) {
            try {
                await fetchAndExtract(key, browser);
            } catch (error) {
                console.error(`Error while processing keyword '${key}': ${error}. Restarting browser.`);
                await browser.close();
                browser = await puppeteer.launch(); // Restart the browser
                await fetchAndExtract(key, browser); // Retry the current keyword
            }
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

// const keywords = [


//    "Advanced Bank Management",
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

    //pearson_daily
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

    //pearson_weekly
    // "9788119847129",
    // "9789356060760",
    // "9788119847624",
    // "9788119847549",
    // "9788119847044",
    // "9788119896691",
    // "9788131727355",
    // "9788131720769",
    // "9788119896608",
    // "9788119847556",
    // "9789357053051",
    // "9788119847402",
    // "9788119847464",
    // "9789357051477",
    // "9788119847617",
    // "9789357054218",
    // "9789332518117",
    // "9788119847358",
    // "9789392970962",
    // "9788131793558",
    // "9788119847594",
    // "9788119847242",
    // "9789357053044",
    // "9789332568839",
    // "9789353062019",
    // "9789357052542",
    // "9789332568723",
    // "9789357054171",
    // "9789332586116",
    // "9789361594021"


    //wolters
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
    // "9788119666768",
    // "9789395736527",
    // "9789389859034",
    // "9788194864547",
    // "9789393553294",
    // "9789395736503",
    // "9789351297222",
    // "9789389859782",
    // "9788119461158",
    // "9788197042591",
    // "9788119461981",
    // "9788119877775",
    // "9788119666720",
    // "9789395736411",
    // "9788197042584",
    // "9788119666799",
    // "9789387506640",
    // "9789393553492",
    // "9789390612659",
    // "9789395736206"

    // "BlackBook of General Awareness ",
    // "Blackbook Of English Vocabulary (2023-2024)",
    // "BlackBook of Samanya Jagrukta (General Awareness) "

    // "Oswaal Books",
    //     "Oswaal Objective", "Oswaal CDS",
    //     "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
    //     "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
    //     "oswal sample paper class 10 2024",
    //     "Oswaal One for All",
    //     "Oswaal CUET",
    //     "Oswaal NCERT",
    //     "Oswaal JEE",
    //     "Oswaal NTSE",
    //     "Oswaal CBSE",
    //     "Oswaal ICSE",
    //     "Oswaal ISC",
    //     "Oswaal NTA",
    //     "Oswaal CAT",
    //     "Oswaal RRB",
    //     "Oswaal Handbook",
    //     "Oswaal RMT",
    //     "Oswaal UGC",
    //     "Oswaal GATE"

//         "Applied Mathematics (Code-241), Class-XII",
//   "Applied Mathematics, Class-XI",
//   "Understanding ICSE Computer Applications with Blue J Class- X",
//   "Understanding ICSE Mathematics Class- X",
//   "ICSE Understanding Computer Applications with Blue J Class- IX",
//   "Understanding ICSE Mathematics Class- IX",
//   "Accountancy (Part-A) Vol-I, Class- XII + Volume 2",
//   "Analysis of Financial Statements Class XII, Part-B (Including Project Work)",
//   "New I.S.C. Accountancy (Volume I Partnership Accounts & Volume II Company Accounts & Analysis of Financial Statements) Class- XII",
//   "New I.S.C. Accountancy Class- XI (Vol. I & II)",
//   "Accountancy Class- XI"


// "Adhunik Hindi Vyakaran Aur Rachna",
// "Basic Science for Class 6",
// "Basic Science for Class 7",
// "Basic Science for Class 8",
// "Foundation Science: Physics for Class 9",
// "Foundation Science: Physics for Class 10",
// "Ganit Parichay 1",
// "Ganit Parichay 2",
// "Ganit Parichay 3",
// "Ganit Parichay 4",
// "Ganit Parichay 5",
// "Hindi Reader 0",
// "Hindi Reader 1",
// "Hindi Reader 2",
// "Hindi Reader 3",
// "Hindi Reader 4",
// "Hindi Reader 5",
// "Junior Maths 1",
// "Junior Maths 2",
// "Junior Maths 3",
// "Junior Maths 4",
// "Junior Maths 5",
// "Math Steps 1",
// "Math Steps 2",
// "Math Steps 3",
// "Math Steps 4",
// "Math Steps 5",
// "Mathematics for Class 6",
// "Mathematics for Class 7",
// "Mathematics for Class 8",
// "Mathematics for Olympiads and Talent Search Competitions for Class 6",
// "Mathematics for Olympiads and Talent Search Competitions for Class 7",
// "Mathematics for Olympiads and Talent Search Competitions for Class 8",
// "My Grammar Time 1",
// "My Grammar Time 2",
// "My Grammar Time 3",
// "My Grammar Time 4",
// "My Grammar Time 5",
// "Our World: Then and Now 1",
// "Our World: Then and Now 2",
// "Our World: Then and Now 3",
// "Sanskrit Bharati 1",
// "Sanskrit Bharati 2",
// "Sanskrit Bharati 3",
// "Sanskrit Bharati 4",
// "Saral Hindi Vyakaran Aur Rachna",
// "Secondary School Mathematics for Class 9",
// "Secondary School Mathematics for Class 10",
// "Senior Secondary School Mathematics for Class 11",
// "Senior Secondary School Mathematics for Class 12",
// "Sugam Sanskrit Vyakaran 1",
// "Sugam Sanskrit Vyakaran 2",
// "The Magic Carpet 1",
// "The Magic Carpet 2",
// "The Magic Carpet 3",
// "The Magic Carpet 4",
// "The Magic Carpet 5",
// "The Magic Carpet 6",
// "The Magic Carpet 7",
// "The Magic Carpet 8",
// "Concepts of Physics 1",
// "Concepts of Physics 2",
// "Modern Approach to Chemical Calculations",
// "Bhoutiki ki Samajh 1",
// "Reactions, Rearrangements and Reagents",
// "Physics MCQ",
// "Chemistry MCQ",
// "Mathematics MCQ",
// "Problems Plus in IIT Mathematics",
// "Organic Chemistry Volume 1: Chemistry of Organic Compounds",
// "High School Bhoutiki 1",
// "High School Bhoutiki 2",
// "High School Rasayanshastra 1",
// "High School Rasayanshastra 2",
// "High School Jeevvigyan 1",
// "High School Jeevvigyan 2",
// "High School Prathmik Ganit 1",
// "High School Prathmik Ganit 2",
// "Sugam Ganit 1",
// "Sugam Ganit 2",
// "Sugam Ganit 3",
// "Sugam Vigyan 1",
// "Sugam Vigyan 2",
// "Sugam Vigyan 3"


// ]; // Add your keywords here

// async function fetchAndExtract(key) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     let allResults = [];

//     for (let pageNum = 1; pageNum <= 25; pageNum++) {  // Adjust the number of pages as needed
//         const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${pageNum}`;
//         await page.goto(pageUrl, { waitUntil: 'networkidle2' });
//         const body = await page.content();
//         const results = extractData(body, pageNum, key);
//         allResults.push(...results.results);

//         // Save results incrementally
//         let currentData = fs.existsSync('results.json') ? JSON.parse(fs.readFileSync('results.json')) : [];
//         currentData.push(...allResults);
//         fs.writeFileSync('results.json', JSON.stringify(currentData, null, 2));
//         allResults = [];  // Clear allResults for next keyword
//     }

//     await page.close();
//     await browser.close();
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

//         var source_url = row_selector('a').first().attr('href');
//         var url_parts = url.parse(`https://www.flipkart.com${source_url}`, true);
//         let serp_obj = {
//             title: row_selector('a.wjcEIp').attr('title'),
//             Isbn: url_parts.query.pid,
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
//     for (const key of keywords) {
//         await fetchAndExtract(key);
//     }
//     console.log('All data has been saved to results.json.');
// }

// scrapeKeywords(keywords);

















// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const url = require('url');

// const keywords = [
    
    
//     "Advanced Bank Management",
// "Bank Financial Management"
// // "Indian Economy &Indian Financial System",
// // "Principles &Practices of Banking",
// // "Accounting &Financial Management for Bankers",
// // "Retail Banking &Wealth Management",
// // "Banking Regulations &Business Laws",
// // "Advanced Business & Financial Management",
// // "macmillan caiib",
// // "macmillan jaiib",
// // "caiib books",
// // "jaiib books",
// // "Caiib resources",
// // "jaiib resources",
// // "caiib new syallabus",
// // "jaiib new syallabus"



// ]; // Add your keywords here

// async function fetchAndExtract(key) {
//     const browser = await puppeteer.launch();
//     let allResults = [];

//     for (let page = 1; page <= 1; page++) {  // Adjust the number of pages as needed
//         const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${page}`;
//         const pageContent = await browser.newPage();
//         await pageContent.goto(pageUrl, { waitUntil: 'networkidle2' });
//         const body = await pageContent.content();
//         const results = extractData(body, page, key);
//         allResults.push(...results.results);
//         await pageContent.close();

//         // Save results incrementally
//         if (fs.existsSync('results.json')) {
//             let currentData = JSON.parse(fs.readFileSync('results.json'));
//             currentData.push(...allResults);
//             fs.writeFileSync('results.json', JSON.stringify(currentData, null, 2));
//         } else {
//             fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
//         }
//         allResults = [];  // Reset results array for the next keyword
//     }

//     await browser.close();
// }

// function extractData(body, page, key) {
//     let $ = cheerio.load(body);
//     let organic_results = $('div._4ddWXP');
//     let results = { state: 'NORMAL', results: [] };

//     organic_results.each((i, elem) => {
//         let row_selector = cheerio.load($(elem).html());
//         var source_url = row_selector('a._2rpwqI').attr('href') || "";
//         var url_parts = url.parse("https://www.flipkart.com" + source_url, true);
//         let serp_obj = {
//             title: row_selector('.s1Q9rs').attr('title'),
//             ASIN: url_parts.query.pid,
//             source: "https://www.flipkart.com" + source_url.split(/\?/)[0] + "/",
//             cover: row_selector('img').attr('src'),
//             author: row_selector('div._3Djpdu').text().trim()
//         };

//         if (serp_obj.source && serp_obj.source !== '') {
//             results.results.push(serp_obj);
//         }
//     });

//     results.results_length = results.results.length;
//     return results;
// }

// async function scrapeKeywords(keywords) {
//     for (const key of keywords) {
//         await fetchAndExtract(key);
//     }
//     console.log('All data has been saved to results.json.');
// }

// scrapeKeywords(keywords);
