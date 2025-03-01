const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputString = `




High School Jeevvigyan 1
High School Prathmik Ganit 2
Sugam Vigyan 
h c verma
r s aggarwal
Mathematics rs aggarwal
concept of physics
`;

// Split the input string to create an array of product IDs
const keywords = inputString.split('\n').map(id => id.trim()).filter(id => id);

async function fetchPage(url) {
    const browser = await puppeteer.launch({headless:false});
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
            keyword: key,
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
    const csvWriter = createCsvWriter({
        path: 'results6.csv',
        header: [
            { id: 'keyword', title: 'Keyword' },
            { id: 'title', title: 'Title' },
            { id: 'source', title: 'Source' },
            { id: 'price', title: 'Price' },
            { id: 'mrp', title: 'MRP' },
            { id: 'discount', title: 'Discount' },
            { id: 'author', title: 'Author' },
            { id: 'cover', title: 'Cover Image URL' }
        ],
        append: fs.existsSync('results.csv') // Append if file exists, otherwise create new
    });

    for (const key of keywords) {
        const url = `https://www.sapnaonline.com/search?keyword=${encodeURIComponent(key)}`;
        const body = await fetchPage(url);
        const keywordResults = extractData(body, key);

        if (keywordResults.results.length > 0) {
            await csvWriter.writeRecords(keywordResults.results);
            console.log(`Data for "${key}" has been added to results.csv.`);
        } else {
            console.log(`No data found for "${key}".`);
        }
    }

    console.log('Scraping complete. Data saved to results.csv.');
}

scrapeKeywords(keywords);











// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const inputString = `
// Adhunik Hindi Vyakaran Aur Rachna
// Basic Science for Class 6
// Basic Science for Class 7
// Basic Science for Class 8
// Foundation Science: Physics for Class 9
// Foundation Science: Physics for Class 10
// Ganit Parichay 1
// Ganit Parichay 2
// Ganit Parichay 3
// Ganit Parichay 4
// Ganit Parichay 5
// Hindi Reader 0
// Hindi Reader 1
// Hindi Reader 2
// Hindi Reader 3
// Hindi Reader 4
// Hindi Reader 5
// Junior Maths 1
// Junior Maths 2
// Junior Maths 3
// Junior Maths 4
// Math Steps 1
// Math Steps 2
// Math Steps 3
// Math Steps 4
// Math Steps 5
// Mathematics for Class 6
// Mathematics for Class 7
// Mathematics for Class 8
// Mathematics for Olympiads and Talent Search Competitions for Class 6
// Mathematics for Olympiads and Talent Search Competitions for Class 7
// Mathematics for Olympiads and Talent Search Competitions for Class 8
// My Grammar Time 1
// My Grammar Time 2
// My Grammar Time 3
// My Grammar Time 4
// My Grammar Time 5
// Our World: Then and Now 1
// Our World: Then and Now 2
// Our World: Then and Now 3
// Sanskrit Bharati 1
// Sanskrit Bharati 2
// Sanskrit Bharati 3
// Sanskrit Bharati 4
// Saral Hindi Vyakaran Aur Rachna
// Secondary School Mathematics for Class 9
// Secondary School Mathematics for Class 10
// Senior Secondary School Mathematics for Class 11
// Senior Secondary School Mathematics for Class 12
// Sugam Sanskrit Vyakaran 1
// Sugam Sanskrit Vyakaran 2
// The Magic Carpet 1
// The Magic Carpet 2
// The Magic Carpet 3
// The Magic Carpet 4
// The Magic Carpet 5
// The Magic Carpet 6
// The Magic Carpet 7
// The Magic Carpet 8
// Concepts of Physics 1
// Concepts of Physics 2
// Modern Approach to Chemical Calculations
// Bhoutiki ki Samajh 1
// Reactions, Rearrangements and Reagents
// Physics MCQ
// Chemistry MCQ
// Mathematics MCQ
// Problems Plus in IIT Mathematics
// Organic Chemistry Volume 1: Chemistry of Organic Compounds
// High School Bhoutiki 1
// High School Bhoutiki 2
// High School Rasayanshastra 1
// High School Rasayanshastra 2
// High School Jeevvigyan 1
// High School Jeevvigyan 2
// High School Prathmik Ganit 1
// High School Prathmik Ganit 2
// Sugam Ganit 1
// Sugam Ganit 2
// Sugam Ganit 3
// Sugam Vigyan 1
// Sugam Vigyan 2
// Sugam Vigyan 3
// h c verma
// r s aggarwal
// Mathematics rs aggarwal
// concept of physics

// `;
// // Split the input string to create an array of product IDs
// const keywords = inputString.split('\n').map(id => id.trim()).filter(id => id);

// async function fetchPage(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });
//     const content = await page.content();
//     await browser.close();
//     return content;
// }

// function extractData(body, key) {
//     let $ = cheerio.load(body);
//     let results = { state: '', results: [] };
//     let block_text = $('div#infoDiv').text();

//     if (block_text.includes('solve the CAPTCHA')) {
//         results.state = 'CAPTCHA_DETECTED';
//         return results;
//     }

//     let organic_results = $('div.sc-AxirZ.CategoryTabInner__ProductBox-qaa80s-0.jZjvfA');
//     organic_results.each((index, element) => {

//         let row_selector = cheerio.load($(element).html());
//         let priceInfo = row_selector('div.sc-AxhCb.jSpsgy');

//         let serp_obj = {
//             title: row_selector('.ProductCard__AboutText-sc-10n3822-2').text(),
//             source: "https://www.sapnaonline.com" + row_selector('.ProductCard__AboutText-sc-10n3822-2').parent().attr('href'),
//             price: priceInfo.find('.ProductCard__PrcieText-sc-10n3822-7').text().trim().replace("₹", '').trim(),
//             mrp: priceInfo.find('.ProductCard__OldPrcieText-sc-10n3822-8').text().trim().replace("₹", '').trim(),
//             discount: priceInfo.find('.ProductCard__DiscountPrcieText-sc-10n3822-9').text().trim(),
//             author: row_selector('h3.ProductCard__AuthorText-sc-10n3822-4').text().replace(/^by /, ''),  // Extracting author information
//             cover: row_selector('img.bookImage').attr('src')
//         };

//         if (serp_obj.source && serp_obj.source !== '' && serp_obj.source !== 'NA- Out of Stock') {
//             results.results.push(serp_obj);
//         }
//     });

//     results.state = 'NORMAL';
//     results.results_length = results.results.length;
//     return results;
// }

// async function scrapeKeywords(keywords) {
//     let allResults = [];

//     for (const key of keywords) {
//         const url = `https://www.sapnaonline.com/search?keyword=${key}`;
//         const body = await fetchPage(url);
//         const keywordResults = extractData(body, key);
//         allResults.push(...keywordResults.results);
//     }

//     fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
//     console.log('All data has been saved to results.json.');
// }

// scrapeKeywords(keywords);
