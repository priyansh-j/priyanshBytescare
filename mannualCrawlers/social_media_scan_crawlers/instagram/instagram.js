// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const delay = (time) => {
//     return new Promise(function(resolve) { 
//         setTimeout(resolve, time);
//     });
// };


// let list = [keywod1 ,keyword2 ];

// const autoScrollAndExtract = async (page, extractData) => {
//     let previousHeight;
//     let newHeight = 0;
//     let scrollCount = 0;

//     while (previousHeight !== newHeight) {
//         previousHeight = newHeight;
//         await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
//         await delay(3000); // Increased delay to slow down scrolling speed
//         newHeight = await page.evaluate('document.body.scrollHeight');
//         scrollCount++;

//         // Extract data after each scroll
//         await extractData(page);

//         console.log(`Scroll count: ${scrollCount}, New height: ${newHeight}`);
//     }
// };

// (async () => {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     const cookies = JSON.parse(fs.readFileSync('insta_cookies.json', 'utf8'));
//     await page.setCookie(...cookies);

//     const results = [];

//     // Define the data extraction function
//     const extractData = async (page) => {
//         const content = await page.content();
//         const $ = cheerio.load(content);

//         $('div.x1qjc9v5.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1lliihq.xdt5ytf').each((i, elem) => {
//             const postLink = $(elem).find('a').attr('href');
//             const imageUrl = $(elem).find('img').attr('src');
//             const altText = $(elem).find('img').attr('alt');
    
//             results.push({
//                 postLink: `https://www.instagram.com${postLink}`,
//                 imageUrl,
//                 altText
//             });
//         });
//     };

//     try {
//         await page.goto('https://www.instagram.com/explore/tags/indiasgotlatent', {
//             waitUntil: 'networkidle2',
//             timeout: 60000 
//         });
//         await delay(10000);

//         // Use the autoScrollAndExtract function to scroll and extract data
//         await autoScrollAndExtract(page, extractData);

//         console.log(results);
//         fs.writeFileSync('insta_posts.json', JSON.stringify(results, null, 2));

//         await page.screenshot({ path: 'instagram.png' });

//         console.log('Page loaded, data extracted, and screenshot taken.');
//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();









const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const keywords = ['indiasgotlatent']; // Add more keywords

const csvFilePath = 'instagram_posts.csv';

// Create CSV writer (ensure file exists with headers)
if (!fs.existsSync(csvFilePath)) {
    const initialCsvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'keyword', title: 'Keyword' },
            { id: 'postLink', title: 'Post Link' },
            { id: 'imageUrl', title: 'Image URL' },
            { id: 'altText', title: 'Alt Text' }
        ],
        append: false // Create a new file with headers if it doesn't exist
    });
    initialCsvWriter.writeRecords([]); // Write headers initially
}

const appendToCSV = async (data) => {
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'keyword', title: 'Keyword' },
            { id: 'postLink', title: 'Post Link' },
            { id: 'imageUrl', title: 'Image URL' },
            { id: 'altText', title: 'Alt Text' }
        ],
        append: true // Append new data
    });

    await csvWriter.writeRecords(data);
    console.log(`Appended ${data.length} records to CSV.`);
};

const autoScrollAndExtract = async (page, keyword) => {
    let previousHeight;
    let newHeight = 0;
    let scrollCount = 0;

    while (previousHeight !== newHeight) {
        previousHeight = newHeight;
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await delay(3000);
        newHeight = await page.evaluate('document.body.scrollHeight');
        scrollCount++;

        // Extract and immediately save data
        const extractedData = await extractData(page, keyword);
        if (extractedData.length > 0) {
            await appendToCSV(extractedData);
        }

        console.log(`Scroll count: ${scrollCount}, New height: ${newHeight}`);
    }
};

const extractData = async (page, keyword) => {
    const content = await page.content();
    const $ = cheerio.load(content);

    const results = [];

    $('div.x1qjc9v5.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1lliihq.xdt5ytf').each((i, elem) => {
        const postLink = $(elem).find('a').attr('href');
        const imageUrl = $(elem).find('img').attr('src');
        const altText = $(elem).find('img').attr('alt');

        if (postLink && imageUrl) {
            results.push({
                keyword,
                postLink: `https://www.instagram.com${postLink}`,
                imageUrl,
                altText
            });
        }
    });

    return results;
};

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const cookies = JSON.parse(fs.readFileSync('insta_cookies.json', 'utf8'));
    await page.setCookie(...cookies);

    for (const keyword of keywords) {
        try {
            const url = `https://www.instagram.com/explore/tags/${keyword}`;
            console.log(`Scraping: ${url}`);

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await delay(5000);

            await autoScrollAndExtract(page, keyword);
            console.log(`Finished scraping for keyword: ${keyword}`);
        } catch (error) {
            console.error(`Failed to scrape keyword "${keyword}":`, error.message);
        }
    }

    await browser.close();
})();
