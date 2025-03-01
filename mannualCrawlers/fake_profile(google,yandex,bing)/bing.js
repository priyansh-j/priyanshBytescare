const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs'); // Include the File System module

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/search?q=physics%20wallah', { waitUntil: 'networkidle2' });
  //await page.goto('https://www.bing.com/', { waitUntil: 'networkidle2' });
  // await page.waitForSelector('textarea#sb_form_q');
  // await page.type('#sb_form_q', 'ချစ်သောနှင်းဆီ ဇာတ်လမ်းတွဲ');
  // await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  let currentPage = 1;
  const maxPages = 4;
  const results = [];

  while (currentPage <= maxPages) {
    const html = await page.content();
    const $ = cheerio.load(html);

    $('li.b_algo').each((index, element) => {
      results.push({
        title: $(element).find('h2 a').text(),
        url: $(element).find('h2 a').attr('href'),
        description: $(element).find('div.b_caption p').text(),
        source: $(element).find('div.tptxt div.tptt').text()
      });
    });

    console.log('Results from Page ' + currentPage + ':', results.length);

    if (currentPage < maxPages) {
      await page.waitForSelector('a.sb_pagN', { visible: true });
      await page.evaluate(() => document.querySelector('a.sb_pagN').scrollIntoView());
      await page.click('a.sb_pagN');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    currentPage++;
  }

  await browser.close();

  // Save the results to a JSON file
  fs.writeFile('bing_results.json', JSON.stringify(results, null, 2), err => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log('Successfully wrote results to results.json');
    }
  });
})();




// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto('https://www.bing.com/', { waitUntil: 'networkidle2' });
//   await page.waitForSelector('textarea#sb_form_q');
//   await page.type('#sb_form_q', 'Shahrukh Khan');
//   await page.keyboard.press('Enter');
//   await page.waitForNavigation({ waitUntil: 'networkidle2' });

//   let currentPage = 1;
//   const maxPages = 4;
//   const results = [];

//   while (currentPage <= maxPages) {
//     const html = await page.content();
//     const $ = cheerio.load(html);

//     $('li.b_algo').each((index, element) => {
//       results.push({
//         title: $(element).find('h2 a').text(),
//         url: $(element).find('h2 a').attr('href'),
//         description: $(element).find('div.b_caption p').text(),
//         source: $(element).find('div.tptxt div.tptt').text()
//       });
//     });

//     console.log('Results from Page ' + currentPage + ':', results.length);

//     if (currentPage < maxPages) {
//       await page.waitForSelector('a.sb_pagN', { visible: true });
//       await page.evaluate(() => document.querySelector('a.sb_pagN').scrollIntoView());
//       await page.click('a.sb_pagN');
//       await page.waitForNavigation({ waitUntil: 'networkidle2' });
//     }
//     currentPage++;
//   }

//   await browser.close();
// })();




// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// (async () => {
//   // Launch a new browser instance
//   const browser = await puppeteer.launch({headless:false});
//   const page = await browser.newPage();

//   // Navigate to Bing.com
//   await page.goto('https://www.bing.com/',{ waitUntil: 'networkidle2' });

//   // Wait for the search bar to be loaded
//    await page.waitForSelector('textarea#sb_form_q');
//   //await page.click('textarea#sb_form_q');
//   // Type "Shahrukh Khan" in the search bar
//   await page.type('#sb_form_q', 'andaz apna apna movie download');

//   // Press Enter to submit the search query
//   await page.keyboard.press('Enter');

//   // Wait for the search results page to be loaded
//   await page.waitForNavigation();

//   // Extract data for multiple pages
//   const results = [];
//   for (let i = 0; i < 3; i++) {
//     // Get the HTML content of the page
//     const html = await page.content();

//     // Parse the HTML content using Cheerio
//     const $ = cheerio.load(html);

//     // Extract data from the selectors
//     $('li.b_algo').each((index, element) => {
//       const result = {};
//       result.title = $(element).find('h2 a').text();
//       result.url = $(element).find('h2 a').attr('href');
//       result.description = $(element).find('div.b_caption p').text();
//       result.source = $(element).find('div.tptxt div.tptt').text();
//       results.push(result);
//     });
//     console.log(results);

//     // Click on the "Next" button to go to the next page
//     if (i < 3) {
//       await page.click('a.sb_pagN');
//       await page.waitForNavigation({ timeout: 60000 }); // 1 minute timeout
//     }
//   }

//   // Save the data to a JSON file
//   fs.writeFileSync('bing_search_results.json', JSON.stringify(results, null, 2));

//   // Close the browser instance
//   await browser.close();
// })();


// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// (async () => {
//   // Launch a new browser instance
//   const browser = await puppeteer.launch({headless:false});
//   const page = await browser.newPage();

//   // Navigate to Bing.com
//   await page.goto('https://www.bing.com/',{ waitUntil: 'networkidle2' });

//   // Wait for the search bar to be loaded
//   await page.waitForSelector('textarea#sb_form_q');
//   //await page.click('textarea#sb_form_q');
//   // Type "Shahrukh Khan" in the search bar
//   await page.type('#sb_form_q', 'Shahrukh Khan');

//   // Press Enter to submit the search query
//   await page.keyboard.press('Enter');

//   // Wait for the search results page to be loaded
//   await page.waitForNavigation();

//   // Get the HTML content of the page
//   const html = await page.content();

//   // Parse the HTML content using Cheerio
//   const $ = cheerio.load(html);

//   // Extract data from the selectors
//   const results = [];
//   $('li.b_algo').each((index, element) => {
//     const result = {};
//     result.title = $(element).find('h2 a').text();
//     result.url = $(element).find('h2 a').attr('href');
//     result.description = $(element).find('div.b_caption p').text();
//     result.source = $(element).find('div.tptxt div.tptt').text();
//     results.push(result);
//   });

//   console.log(results);

//   // Close the browser instance
//   await browser.close();
// })();