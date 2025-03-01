const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const keywords = ["Advanced Bank Management",
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
"jaiib new syallabus"]; // List your keywords here

async function fetchPage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();
    return content;
}

function extractData(body, key) {
    let $ = cheerio.load(body);
    let results = { state: '', results: [] };
    let block_text = $('div#infoDiv').text();

    if (block_text.includes('solve the CAPTCHA')) {
        results.state = 'CAPTCHA_DETECTED';
        return results;
    }

    let organic_results = $('div.list-view-books');
    organic_results.each((index, element) => {
        let row_selector = cheerio.load($(element).html());
        let priceInfo = row_selector('div.price-attrib');

        let serp_obj = {
            title: row_selector('.title a').text(),
            source: row_selector('.title a').attr('href'),
            price: priceInfo.find('.price .sell').text().trim(),
            mrp: priceInfo.find('.price .list').text().trim(),
            binding: priceInfo.find('div.attributes-title').first().text().trim(), // assuming the first `div.attributes-title` is always Binding
            releaseDate: priceInfo.find('div.attributes-title').eq(1).text().trim(), // assuming the second is Release Date
            //language: priceInfo.find('div.attributes-title').last().text().trim(), // assuming the last is Language
            publisher: row_selector('div.author-publisher a').first().text().trim(), // assuming the first link in `div.author-publisher` is always Publisher
            cover: row_selector('div.cover img').attr('src'), // Extracting cover image
            author: row_selector('div.author-publisher').eq(1).find('a').map((i, el) => $(el).text()).get().join(', ')
        };

        if (serp_obj.source && serp_obj.source !== '' && serp_obj.source !== 'NA- Out of Stock') {
            results.results.push(serp_obj);
        }
    });

    results.state = 'NORMAL';
    results.results_length = results.results.length;
    return results;
}

async function scrapeKeywords(keywords) {
    let allResults = [];

    for (const key of keywords) {
        const url = `https://www.bookswagon.com/search-books/${key}`;
        const body = await fetchPage(url);
        const keywordResults = extractData(body, key);
        allResults.push(...keywordResults.results);
    }

    fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
    console.log('All data has been saved to results.json.');
}

scrapeKeywords(keywords);
