const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

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
    
    
    ];  // Example product IDs

async function fetchAndExtract(key) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let allResults = [];
        const pageUrl = `https://www.flipkart.com/sellers?pid=${key}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const body = await page.content();
        const results = extractData(body, key);  // Make sure to capture the results from this function call
        allResults.push(...results.results);  // Use the results here

        // Save results incrementally
        let currentData = fs.existsSync('seller_results.json') ? JSON.parse(fs.readFileSync('seller_results.json')) : [];
        currentData.push(...allResults);
        fs.writeFileSync('seller_results.json', JSON.stringify(currentData, null, 2));
        allResults = [];  // Clear allResults for next keyword
    

    await page.close();
    await browser.close();
    return allResults;  // Return the compiled results from all keywords
}

function extractData(body, key) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };  // Define results here to be used in the function
    let organic_results = $('div.UQFoop');

    organic_results.each((i, elem) => {
        let row_selector = cheerio.load($(elem).html());
        let serp_obj = {
            seller: row_selector('div.EElWwG span').text().trim(),
            rating: row_selector('div.XQDdHH').text().trim(),
            price: row_selector('div.Nx9bqj').text().trim(),
            mrp: row_selector('div.yRaY8j').text().trim(),
            discount: row_selector('div.UkUFwK span').text().trim(),
            Isbn: key
        };

        if (serp_obj.seller) {
            results.results.push(serp_obj);
        }
    });

    results.state = 'NORMAL';
    results.results_length = results.results.length;
    return results;  // Ensure this return is within the scope of the function where results is defined
}

async function scrapeKeywords(keywords) {
    for (const key of keywords) {
        const keywordResults = await fetchAndExtract(key);  // Make sure to handle the returned value
        console.log('Data for key:', key, 'has been processed.');
    }
    console.log('All data has been saved to seller_results.json.');
}

scrapeKeywords(keywords);
