const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const url = require('url');

const keywords = [


    "Advanced Bank Management",
    "Bank Financial Management",
    "Indian Economy &Indian Financial System",
    "Principles &Practices of Banking",
    "Accounting &Financial Management for Bankers",
    "Retail Banking &Wealth Management",
    "Banking Regulations &Business Laws",
    "Advanced Business & Financial Management",
    "macmillan caiib",
    "macmillan jaiib",
    "caiib books",
    "jaiib books",
    "Caiib resources",
    "jaiib resources",
    "caiib new syallabus",
    "jaiib new syallabus"

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

    // //pearson_weekly
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

    // "Oswaal Books",
        // "Oswaal Objective", "Oswaal CDS",
        // "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
        // "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
        // "oswal sample paper class 10 2024",
        // "Oswaal One for All",
        // "Oswaal CUET",
        // "Oswaal NCERT",
        // "Oswaal JEE",
        // "Oswaal NTSE",
        // "Oswaal CBSE",
        // "Oswaal ICSE",
        // "Oswaal ISC",
        // "Oswaal NTA",
        // "Oswaal CAT",
        // "Oswaal RRB",
        // "Oswaal Handbook",
        // "Oswaal RMT",
        // "Oswaal UGC",
        // "Oswaal GATE"
]; // Add your keywords here

async function fetchAndExtract(key) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let allResults = [];

    for (let pageNum = 1; pageNum <= 4; pageNum++) {  // Adjust the number of pages as needed
        const pageUrl = `https://www.flipkart.com/search?q=${key}&page=${pageNum}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const body = await page.content();
        const results = extractData(body, pageNum, key);
        allResults.push(...results.results);

        // Save results incrementally
        let currentData = fs.existsSync('results.json') ? JSON.parse(fs.readFileSync('results.json')) : [];
        currentData.push(...allResults);
        fs.writeFileSync('results.json', JSON.stringify(currentData, null, 2));
        allResults = [];  // Clear allResults for next keyword
    }

    await page.close();
    await browser.close();
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

        var source_url = row_selector('a').first().attr('href');
        var url_parts = url.parse(`https://www.flipkart.com${source_url}`, true);
        let serp_obj = {
            title: row_selector('a.wjcEIp').attr('title'),
            Isbn: url_parts.query.pid,
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
    for (const key of keywords) {
        await fetchAndExtract(key);
    }
    console.log('All data has been saved to results.json.');
}

scrapeKeywords(keywords);

















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
