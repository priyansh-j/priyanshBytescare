const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

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

// "The New Book of Mathematics, Class-XII (Two Volume Set)",
//   "Applied Mathematics (Code-241), Class-XII",
//   "Understanding I.S.C. Mathematics Class- XII (2 Vol Set)",
//   "The New Book of Mathematics , Class-XI",
//   "Applied Mathematics, Class-XI",
//   "Understanding I.S.C. Mathematics (Vol. I & II) Class- XI",
//   "Understanding ICSE Computer Applications with Blue J Class- X",
//   "Understanding ICSE Mathematics Class- X",
//   "ICSE Understanding Computer Applications with Blue J Class- IX",
//   "Understanding ICSE Mathematics Class- IX",
//   "Accountancy (Part-A) Vol-I, Class- XII + Volume 2",
//   "Analysis of Financial Statements Class XII, Part-B (Including Project Work)",
//   "New I.S.C. Accountancy (Volume I Partnership Accounts & Volume II Company Accounts & Analysis of Financial Statements) Class- XII",
//   "Indian History World Developments and Civics Class- IX",
//   "ICSE Modern Indian History Contemporary World & Civics Class- X",
//   "New I.S.C. Accountancy Class- XI (Vol. I & II)",
//   "Understanding I.S.C. Computer Science (Java with Blue J) Class- XI",
//   "Accountancy Class- XI",


]; // List your keywords here

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

    let organic_results = $('div.sc-AxirZ.CategoryTabInner__ProductBox-qaa80s-0.jZjvfA');
    organic_results.each((index, element) => {

        let row_selector = cheerio.load($(element).html());
        let priceInfo = row_selector('div.sc-AxhCb.jSpsgy');

        let serp_obj = {
            title: row_selector('.ProductCard__AboutText-sc-10n3822-2').text(),
            source: "https://www.sapnaonline.com" + row_selector('.ProductCard__AboutText-sc-10n3822-2').parent().attr('href'),
            price: priceInfo.find('.ProductCard__PrcieText-sc-10n3822-7').text().trim().replace("₹", '').trim(),
            mrp: priceInfo.find('.ProductCard__OldPrcieText-sc-10n3822-8').text().trim().replace("₹", '').trim(),
            discount: priceInfo.find('.ProductCard__DiscountPrcieText-sc-10n3822-9').text().trim(),
            author: row_selector('h3.ProductCard__AuthorText-sc-10n3822-4').text().replace(/^by /, ''),  // Extracting author information
            cover: row_selector('img.bookImage').attr('src')
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
        const url = `https://www.sapnaonline.com/search?keyword=${key}`;
        const body = await fetchPage(url);
        const keywordResults = extractData(body, key);
        allResults.push(...keywordResults.results);
    }

    fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
    console.log('All data has been saved to results.json.');
}

scrapeKeywords(keywords);
