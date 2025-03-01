// const cheerio = require('cheerio');
// const axios = require('axios');
// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const proxies = {
//     "http": "http://YcxXUKUSyPIO5MRn:wifi;;;;@rotating.proxyempire.io:9000",
//     "https": "http://YcxXUKUSyPIO5MRn:wifi;;;;@rotating.proxyempire.io:9000"
// };
// const engines = {
//     twitter1: {
//         searchURL: function (key) {
//             return `https://www.google.com/search?q=${key}&num=100`;
//         },
//         extract: function (body, accurate, page) {
//             let $ = cheerio.load(body);
//             let organic_results = $('#center_col .g');
//             let results = { state: '', results: [] };

//             let block_text = $('div#infoDiv').text();
//             if (block_text.includes('solve the CAPTCHA')) {
//                 results.state = 'CAPTCHA_DETECTED';
//                 return results;
//             }

//             let no_results = $('.card-section > div > b');
//             if (accurate === '1' && no_results.length > 0) {
//                 results.state = 'NO_ACCURATE';
//                 return results;
//             }

//             organic_results.each(function() {
//                 let row_selector = cheerio.load($(this).html());
//                 let serp_obj = {
//                     source: row_selector('div.yuRUbf > div > span > a').first().attr('href'),
//                     title: row_selector('div.yuRUbf > div > span > a > h3').first().text(),
//                     description: row_selector('div:nth-child(2) > div > span').text()
//                 };

//                 if (serp_obj.source && serp_obj.source !== '') {
//                     results.results.push(serp_obj);
//                 }
//             });

//             if (page === '1') {
//                 results.page = body;
//             }
//             results.state = 'NORMAL';
//             results.results_length = results.results.length;
//             return results;
//         }
//     }
// };

// async function getPageContent(url) {
//     // const browser = await puppeteer.launch({ headless: false }); // Set headless to false to see the browser
//     // const page = await browser.newPage();
//     // await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until page load

//     // const content = await page.content(); // Get the HTML content of the page
//     // await browser.close();
//     // return content;
//     const proxy = proxies.http; // Using the HTTP proxy

//     const browser = await puppeteer.launch({
//         headless: false, // Set headless to false to see the browser
//         args: [`--proxy-server=${proxy}`] // Set the proxy server
//     });

//     const page = await browser.newPage();

//     // Optional: Set up page to use the proxy credentials
//     // await page.authenticate({
//     //     username: "package-10001",
//     //     password: "uHUtgPyRMmABDjT0"
//     // });

//     await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until page load

//     const content = await page.content(); // Get the HTML content of the page
//     await browser.close();
//     return content;
// }

const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const useProxy = require('puppeteer-page-proxy');

const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
};

const engines = {
    twitter1: {
        searchURL: function (key) {
           // return `${key}`;
         //return `https://www.google.com/search?q=${key}&num=100`;
         return`https://www.google.com/search?q=site:https://www.meesho.com/${key}&num=100`;
        //return `https://www.google.com/search?q=site:https://www.facebook.com/people ${key}&num=100`;
       // return `https://www.google.com/search?q=site:twitter.com  ${key} profiles &num=100`;
         // return`https://telemetr.io/en/channels?err=2,1000&channel=${key}`;
         //return `https://www.google.com/search?q=site:https://www.instagram.com/ ${key}&num=1000`;
         //return `https://www.google.com/search?q=site:twitter.com inurl:status"${key}"&num=100`;      // for twitter posts we can use this url  https://www.google.com/search?q=site:twitter.com+inurl:status+%22pw%22&num=100
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
    const browser = await puppeteer.launch({headless:false });// Set headless to false to see the browser
    const page = await browser.newPage();
    
   // await useProxy(page, proxyUrl);
   // await useProxy(page);

    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until page load
    //await page.waitForTimeout(1000);
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



// const inputString = `
// \"Blackbook of English vocabulary\" site:meesho.com
// \"Blackbook of General Awareness\" site:meesho.com
// \"Blackbook of सामान्य जागरूकता\" site:meesho.com

// `;

// // Split the input string to create an array of product IDs
// const searchKeywords  = inputString.split('\n').map(id => id.trim()).filter(id => id);

const  searchKeywords  = [
  
"Adhunik Hindi Vyakaran Aur Rachna",
    "Basic Science for Class",
    "Foundation Science: Physics",
    "rs aggarwal",
    "Hindi Reader",
    "Junior Maths",
    "Math Steps",
    "Mathematics for Class",
    "h.c verma",
    "My Grammar Time",
    "Our World: Then and Now",
    "Sanskrit Bharati",
    "Saral Hindi Vyakaran Aur Rachna",
    "Secondary School Mathematics for Class",
    "The Magic Carpet",
    "Concepts of Physics",
    "Bhoutiki ki Samajh",
    "Problems Plus in IIT Mathematics",
    "Organic Chemistry Volume 1: Chemistry of Organic Compounds",
    "High School Prathmik Ganit",
    "Sugam Ganit",

    // "Blackbook of General Awareness",
    // "Blackbook of सामान्य जागरूकता",
    // "Blackbook of English vocabulary",


];



const path = 'searchResults.json';

// Function to append results to a JSON file
function appendResultsToFile(results) {
    fs.readFile(path, (err, data) => {
        let json = [];
        if (!err && data.length) {
            json = JSON.parse(data.toString()); // Parse the existing data
        }
        json.push(...results); // Append new results

        fs.writeFile(path, JSON.stringify(json, null, 2), err => {
            if (err) {
                console.error('Error writing file', err);
            } else {
                console.log('Successfully appended results to searchResults.json');
            }
        });
    });
}
async function performSearches() {
    for (const keyword of searchKeywords) {
        try {
            const results = await testSearch(keyword);
            if (results && results.results) {
                appendResultsToFile(results.results); // Append results after each keyword search
            }
            await delay(10000);
        } catch (error) {
            console.error(`Error fetching results for ${keyword}:`, error);
        }
    }
}

performSearches(); // Call the function to perform searches



// async function testSearch(searchKey) { // Modified to take searchKey as a parameter
//     let searchUrl = engines.twitter1.searchURL(searchKey);

//     try {
//         const pageContent = await getPageContent(searchUrl);
//         let results = engines.twitter1.extract(pageContent, '1', '1');
//         console.log(results);
//     } catch (error) {
//         console.error('Error during search:', error);
//     }
// }

// // Array of search keywordsut69 HD movie

// const searchKeywords = [
        // "\"UT69 full movie\" -review -interview -news after:2023-11-03",
        // "\"UT69 download\" site:telemetr.io after:2023-11-03",
        // "UT69 download filetype:torrent after:2023-11-03",
        // "UT69 full movie filetype:mkv | filetype:mp4 after:2023-11-03",
        // "intitle:UT69 \"full movie\" -review -interview -news after:2023-11-03",
        // "inurl:UT69 \"download\" -review -interview -news after:2023-11-03",
        // "\"UT69\" -site:youtube.com -site:vimeo.com intitle:\"full movie\" -review -interview -news site:telemetr.io after:2023-11-03",
        // "\"UT69\" \"2023\" \"download\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"full movie\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"download\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"1080\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"720\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"480\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"magnet\" -review -interview -news after:2023-11-03",
        // "\"UT69\" \"torrent\" -review -interview -news after:2023-11-03"

//     ]


// // Running the testSearch for each keyword
// searchKeywords.forEach(keyword => {
//     testSearch(keyword);
// });



// async function testSearch() {
//     let searchKey = '\"UT69\" \"torrent\" -review -interview -news after:2023-11-03'; // Replace with your test search term
//     let searchUrl = engines.twitter1.searchURL(searchKey);

//     try {
//         const pageContent = await getPageContent(searchUrl);
//         let results = engines.twitter1.extract(pageContent, '1', '1');
//         console.log(results);
//     } catch (error) {
//         console.error('Error during search:', error);
//     }
// }

// testSearch();




