const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const useProxy = require('puppeteer-page-proxy');
const { createObjectCsvWriter } = require('csv-writer');
const engines = {
    twitter1: {
        searchURL: function (key) {
         
            return`https://www.google.com/search?q=site:https://www.meesho.com/${key}&num=100`;
        },
        extract: function (body, accurate, page) {
            let $ = cheerio.load(body);
            let organic_results = $('#center_col .g');
            let results = { state: '', results: [] };

            let block_text = $('div#infoDiv').text();
            if (block_text.includes('solve the CAPTCHA')) {
                results.state = 'CAPTCHA_DETECTED';
                return results;
            }

            let no_results = $('.card-section > div > b');
            if (accurate === '1' && no_results.length > 0) {
                results.state = 'NO_ACCURATE';
                return results;
            }

            organic_results.each(function() {
                let row_selector = cheerio.load($(this).html());
                let serp_obj = {
                    source: row_selector('div.yuRUbf > div > span > a').first().attr('href'),
                    title: row_selector('div.yuRUbf > div > span > a > h3').first().text(),
                    description: row_selector('div:nth-child(2) > div > span').text()
                };

                if (serp_obj.source && serp_obj.source !== '') {
                    results.results.push(serp_obj);
                }
            });

            if (page === '1') {
                results.page = body;
            }
            results.state = 'NORMAL';
            results.results_length = results.results.length;
            return results;
        }
    }
};

// const proxies = {
//     http: "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
//     https: "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
// };
const proxyUrl = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

// Create a custom Axios instance with proxy configuration
const axiosInstance = axios.create({
  proxy: {
    host: 'rotating.proxyempire.io',
    port: 5000,
    auth: {
      username: 'package-10001',
      password: 'YcxXUKUSyPIO5MRn'
    }
  }
});

async function getPageContent(url) {
    const browser = await puppeteer.launch({headless:false});// Set headless to false to see the browser
    const page = await browser.newPage();

   // await useProxy(page, proxyUrl);
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until page load

    const content = await page.content(); // Get the HTML content of the page
    await browser.close();
    return content;
}

// Rest of your code remains the same

async function testSearch(searchKey) {
    let searchUrl = engines.twitter1.searchURL(searchKey);

    try {
        const pageContent = await getPageContent(searchUrl);
        let results = engines.twitter1.extract(pageContent, '1', '1');
        return results; // Return results instead of console logging
    } catch (error) {
        console.error('Error during search:', error);
    }
}

const searchKeywords = [

    "Blackbook of General Awareness",
  "Blackbook of सामान्य जागरूकता",
  "Blackbook of English vocabulary",

        
        
];

function saveResultsToCsv(results) {
    const csvWriter = createObjectCsvWriter({
        path: 'searchResults_flipkart.csv',
        header: [
            { id: 'source', title: 'Source' },
            { id: 'title', title: 'Title' },
            { id: 'description', title: 'Description' }
        ]
    });

    csvWriter.writeRecords(results)
        .then(() => {
            console.log('Successfully wrote results to searchResults_flipkart.csv');
        })
        .catch(err => {
            console.error('Error writing CSV file', err);
        });
}

async function performSearches() {
    let allResults = []; // Array to store results from all keywords

    for (const keyword of searchKeywords) {
        
        const results = await testSearch(keyword);
        if (results && results.results) {
            allResults.push(...results.results); // Spread operator to flatten the results
        }
    }

    saveResultsToCsv(allResults); // Save the collected results to a file
}

performSearches(); // Call the function to perform searches
