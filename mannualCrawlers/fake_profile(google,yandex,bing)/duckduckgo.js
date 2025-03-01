const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Array of search keywords
    const keywords = ['allen kota']; // Replace with your keywords
    let allResults = {};

    for (let key of keywords) {
        const url = `https://duckduckgo.com/?q=${key}&t=ha&va=j&ia=web`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Get the HTML of the page
        const content = await page.content();
        const $ = cheerio.load(content);

        let organic_results = $('li[data-layout="organic"]');

        if (organic_results.length === 0) {
            console.log(`No organic results found for keyword: ${key}`);
            allResults[key] = { state: 'NO_RESULTS', results: [] };
            continue;
        }

        let results = { state: 'SUCCESS', results: [] };

        organic_results.each((index, element) => {
            let row_selector = cheerio.load($(element).html());
            let serp_obj = {
                source: row_selector('a.Rn_JXVtoPVAFyGkcaXyK').attr('href') || '',
                title: row_selector('h2 a[data-testid="result-title-a"]').text().trim(),
                description: row_selector('div[data-result="snippet"]').text().trim()
            };

            console.log(`Result ${index + 1} for keyword "${key}":`, serp_obj);

            results.results.push(serp_obj);
        });

        allResults[key] = results;
    }

    // Save results to a JSON file
    fs.writeFileSync('search_results.json', JSON.stringify(allResults, null, 2));

    console.log('Results saved to search_results.json');
    await browser.close();
})();






