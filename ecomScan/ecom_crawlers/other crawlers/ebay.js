const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// CSV Writer setup
const csvWriter = createCsvWriter({
    path: 'ebay_results.csv',
    header: [
        {id: 'keyword', title: 'Keyword'},
        {id: 'title', title: 'Title'},
        {id: 'source', title: 'Source'},
        {id: 'price', title: 'Price'}
    ]
});

async function scrapeEbay(key, page) {
    const url = `https://www.ebay.com/sch/i.html?&_nkw=${key}&_pgn=${page}`;

    const browser = await puppeteer.launch({
        headless: true,  // Set to false if you want to see the browser window for debugging
    });
    const pageInstance = await browser.newPage();

    try {
        await pageInstance.goto(url, { waitUntil: 'domcontentloaded' });

        // Get the page content and load it into Cheerio
        const body = await pageInstance.content();
        const $ = cheerio.load(body);

        // Define results object
        let results = [];

        // CAPTCHA detection
        let block_text = $('div#infoDiv').text();
        if (block_text.includes('solve the CAPTCHA if you are using advanced terms that robots are known to use')) {
            console.log('CAPTCHA Detected');
            return results;
        }

        // Check for no results
        let no_results = $('.card-section > div > b');
        if (no_results.length > 0) {
            console.log(`No accurate results found for keyword: ${key}`);
            return results;
        }

        // Scraping the organic search results
        let organic_results = $('div.s-item__info.clearfix');
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());

            let serp_obj = {
                keyword: key,  // Add keyword to the object for tracking
                title: row_selector('span').first().text(),
                source: row_selector('a').first().attr('href'),
                price: row_selector('span.s-item__price').first().text().replace("$", '').trim(),
            };

            if (serp_obj.source && serp_obj.source !== '' && serp_obj.source !== 'NA - Out of Stock') {
                results.push(serp_obj);
            }
        }

        return results;

    } catch (err) {
        console.error(`Error scraping eBay for keyword: ${key}`, err);
        return [];
    } finally {
        await browser.close();
    }
}

async function scrapeMultipleKeywords(keywords, pages) {
    let allResults = [];

    for (let key of keywords) {
        for (let page = 1; page <= pages; page++) {
            console.log(`Scraping keyword "${key}" - Page ${page}`);
            const results = await scrapeEbay(key, page);
            allResults = allResults.concat(results);
        }
    }

    // Write results to CSV
    if (allResults.length > 0) {
        await csvWriter.writeRecords(allResults);
        console.log('Results successfully written to ebay_results.csv');
    } else {
        console.log('No results found to write to CSV.');
    }
}

// Example usage:
(async () => {
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
Sugam Ganit 1
Sugam Ganit 2
Sugam Ganit 3
Sugam Vigyan 1
Sugam Vigyan 2
Sugam Vigyan 3


`;
// Split the input string to create an array of product IDs
const keywords  = inputString.split('\n').map(id => id.trim()).filter(id => id);
  //  let keywords = ['laptop', 'smartphone', 'headphones'];  // Example keywords
    let pages = 3;  // Number of pages to scrape per keyword
    await scrapeMultipleKeywords(keywords, pages);
})();
