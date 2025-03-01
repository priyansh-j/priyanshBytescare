const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeSnapdeal(key) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(`https://www.snapdeal.com/search?keyword=${key}&sort=rlvncy`, { waitUntil: 'networkidle2' });
    const content = await page.content();
    const $ = cheerio.load(content);
    
    let results = [];
    
    let block_text = $('div#infoDiv').text();
    if (block_text.includes('solve the CAPTCHA if you are using advanced terms that robots are known to use')) {
        results.state = 'CAPTCHA_DETECTED';
        await browser.close();
        return results;
    }

    let no_results = $('.card-section > div > b');
    if (no_results.length > 0) {
        results.state = 'NO_ACCURATE';
        await browser.close();
        return results;
    }
    
    //await autoScroll(page);
    let organic_results = $('div.col-xs-6.favDp.product-tuple-listing.js-tuple');
    
    for (let i = 0; i < organic_results.length; i++) {
        let row_selector = cheerio.load(organic_results.eq(i).html());
        let serp_obj = {
            title: row_selector('div.product-tuple-description > div.product-desc-rating > a > p').attr('title'),
            source: row_selector('div.product-tuple-image > a').attr('href'),
            price: $('span.product-price').eq(i).text().replace('Rs.', '').trim(),
            mrp: row_selector('span.lfloat.product-desc-price.strike').text().replace('Rs.', '').trim(),
            author: row_selector('p.product-author-name').attr('title')
        };
        
        if (serp_obj.source && serp_obj.source !== '') {
            results.push(serp_obj);
        }
    }

    await browser.close();
    return results;
}

async function autoScroll(page) {
    let tenSeconds = 10000; // 10 seconds in milliseconds
    let endTime = Date.now() + tenSeconds;

    await page.evaluate(async (endTime) => {
        await new Promise((resolve, reject) => {
            var interval = setInterval(() => {
                window.scrollBy(0, 100);
                if (Date.now() > endTime) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }, endTime);
}

async function scrapeMultipleKeywords(keywords) {
    let allData = []; 
    for (let key of keywords) {
        const result = await scrapeSnapdeal(key);
        allData = allData.concat(result); 
    }
    fs.writeFileSync('results.json', JSON.stringify(allData, null, 2), 'utf8');
    console.log('All results saved to results.json');
}

// Example usage with multiple keywords
const keywords = [
    
//     "Applied Mathematics (Code-241), Class-XII",
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


"BlackBook of General Awareness ",
    "Blackbook Of English Vocabulary (2023-2024)",
    "BlackBook of Samanya Jagrukta (General Awareness) "


];
scrapeMultipleKeywords(keywords);

