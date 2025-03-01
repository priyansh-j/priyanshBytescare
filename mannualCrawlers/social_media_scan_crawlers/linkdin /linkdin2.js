const puppeteer = require('puppeteer');
const useProxy = require('puppeteer-page-proxy');
const fs = require('fs');
const cheerio = require('cheerio');
const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};
(async () => {
    // Define the proxy server
    //const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

    // Launch the browser without any proxy arguments directly in the launch function
    const browser = await puppeteer.launch({headless: false});

    const page = await browser.newPage();

    // Apply the proxy to the page using puppeteer-page-proxy
    //await useProxy(page, proxyServer);

    // Set additional options if the proxy requires authentication (not usually needed when credentials are in URL)
    // await page.authenticate({
    //     username: 'package-10001',
    //     password: 'YcxXUKUSyPIO5MRn'
    // });

    // Load cookies from the JSON file
    const cookies = JSON.parse(fs.readFileSync('linkedin_cookies.json', 'utf8'));

    // Set cookies in the page
    await page.setCookie(...cookies);

    // Try navigating to LinkedIn's profile page
    try {
        await page.goto('https://www.linkedin.com/search/results/content/?keywords=physics%20wallah%20&sid=dcw', {
            waitUntil: 'networkidle2',
            timeout: 60000 // Set timeout to 60 seconds
        });
        await delay(5000);

        // Optionally, take a screenshot
        await page.screenshot({ path: 'linkedin.png' });

        console.log('Page loaded and screenshot taken.');

        // Get the page content
        const content = await page.content();
        
        // Load the content into Cheerio
        const $ = cheerio.load(content);

        // Initialize an array to hold all the extracted information
        const data = [];

        // Iterate over each post element
        // $('div#fie-impression-container').each((index, element) => {
        //     const profileUrl = $(element).find('a.update-components-actor__image').attr('href');
        //     //const postUrl = $(element).find('a.update-components-article__image-link').attr('href');
        //     const postDescription = $(element).find('div.feed-shared-update-v2__description-wrapper span.text-view-model').text();
        //     const url = $(element).attr('data-urn');

        //     // Construct the post URL from the URN
        //     const postUrl = `https://www.linkedin.com/feed/update/${url}`;
        //     // Push the extracted information into the data array
        //     data.push({
        //         profileUrl: profileUrl,
        //         postUrl: postUrl,
        //         postDescription: postDescription
        //     });
        // });

        $('div.feed-shared-update-v2').each((index, element) => {
            const profileUrl = $(element).find('a.update-components-actor__image').attr('href');
            const postDescription = $(element).find('div.feed-shared-update-v2__description-wrapper span.text-view-model').text();
            const urn = $(element).attr('data-urn');

            // Construct the post URL from the URN
            const postUrl = `https://www.linkedin.com/feed/update/${urn}`;

            // Push the extracted information into the data array
            data.push({
                profileUrl: profileUrl,
                postUrl: postUrl,
                postDescription: postDescription
            });
        });


        // Write the data array to a JSON file
        fs.writeFileSync('linkedin_data.json', JSON.stringify(data, null, 2));

        console.log('Data extracted and written to linkedin_data.json');

    } catch (error) {
        console.error('Failed to load page:', error.message);
    }

    await browser.close();
})();










// const puppeteer = require('puppeteer');
// const useProxy = require('puppeteer-page-proxy');
// const fs = require('fs');
// const cheerio = require('cheerio');
// const delay = (time) => {
//     return new Promise(function(resolve) { 
//       setTimeout(resolve, time);
//     });
// };
// (async () => {
//     // Define the proxy server
//     //const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     // Launch the browser without any proxy arguments directly in the launch function
//     const browser = await puppeteer.launch({headless: false});

//     const page = await browser.newPage();

//     // Apply the proxy to the page using puppeteer-page-proxy
//     //await useProxy(page, proxyServer);

//     // Set additional options if the proxy requires authentication (not usually needed when credentials are in URL)
//     // await page.authenticate({
//     //     username: 'package-10001',
//     //     password: 'YcxXUKUSyPIO5MRn'
//     // });

//     // Load cookies from the JSON file
//     const cookies = JSON.parse(fs.readFileSync('linkedin_cookies.json', 'utf8'));

//     // Set cookies in the page
//     await page.setCookie(...cookies);

//     // Try navigating to LinkedIn's profile page
//     try {
//         await page.goto('https://www.linkedin.com/search/results/content/?keywords=physics%20wallah%20&sid=dcw', {
//             waitUntil: 'networkidle2',
//             timeout: 60000 // Set timeout to 60 seconds
//         });
//         await delay(10000);

//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'linkedin.png' });

//         console.log('Page loaded and screenshot taken.');

//         // Get the page content
//         const content = await page.content();
        
//         // Load the content into Cheerio
//         const $ = cheerio.load(content);

//         // Extract information
//         const profileUrl = $('a.update-components-actor__image').attr('href');
//         const postUrl = $('a.update-components-article__image-link').attr('href');
//         const postDescription = $('div.feed-shared-update-v2__description-wrapper span.text-view-model').text();

//         console.log('Profile URL:', profileUrl);
//         console.log('Post URL:', postUrl);
//         console.log('Post Description:', postDescription);

//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();


















// const puppeteer = require('puppeteer');
// const useProxy = require('puppeteer-page-proxy');
// const fs = require('fs');

// (async () => {
//     // Define the proxy server
//     const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     // Launch the browser without any proxy arguments directly in the launch function
//     const browser = await puppeteer.launch({headless: false});

//     const page = await browser.newPage();

//     // Apply the proxy to the page using puppeteer-page-proxy
//     await useProxy(page, proxyServer);

//     // Set additional options if the proxy requires authentication (not usually needed when credentials are in URL)
//     await page.authenticate({
//         username: 'package-10001',
//         password: 'YcxXUKUSyPIO5MRn'
//     });

//     // Load cookies from the JSON file
//     const cookies = JSON.parse(fs.readFileSync('linkedin_cookies.json', 'utf8'));

//     // Set cookies in the page
//     await page.setCookie(...cookies);

//     // Try navigating to LinkedIn's profile page
//     try {
//         await page.goto('https://www.linkedin.com/search/results/content/?keywords=physics%20wallah%20&sid=dcw', {
//             waitUntil: 'networkidle2',
//             timeout: 60000 // Set timeout to 60 seconds
//         });
//         await page.waitForTimeout(10000);

//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'linkedin.png' });

//         console.log('Page loaded and screenshot taken.');
//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();







// const puppeteer = require('puppeteer');
// const useProxy = require('puppeteer-page-proxy');

// (async () => {
//     // Define the proxy server
//     const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     // Launch the browser without any proxy arguments directly in the launch function
//     const browser = await puppeteer.launch({headless:false});

//     const page = await browser.newPage();

//     // Apply the proxy to the page using puppeteer-page-proxy
//     await useProxy(page, proxyServer);

//     // Set additional options if the proxy requires authentication (not usually needed when credentials are in URL)
//     await page.authenticate({
//         username: 'package-10001',
//         password: 'YcxXUKUSyPIO5MRn'
//     });

//     // Try navigating to Instagram's explore page
//     try {
//         await page.goto('https://www.linkedin.com/in/priyansh-jain-91005a213/');

//         await page.waitForTimeout(5000);

//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'linkdin.png' });

//         console.log('Page loaded and screenshot taken.');

//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();








// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Load cookies from 'linkedin_cookies.json'
//     if (fs.existsSync('linkedin_cookies.json')) {
//         const cookies = JSON.parse(fs.readFileSync('linkedin_cookies.json', 'utf8'));
//         for (const cookie of cookies) {
//             await page.setCookie(cookie);
//         }
//         console.log('Cookies loaded successfully.');
//     } else {
//         console.log('No cookie file found. Please ensure you are logged in and cookies are saved.');
//         await browser.close();
//         return; // Stop execution if no cookies are found
//     }

//     // Navigate after loading cookies
//     await page.goto('https://www.linkedin.com/in/priyansh-jain-91005a213/');

//     // Additional operations or checks...
//     await page.waitForTimeout(10000);
//     await page.screenshot({path: 'linkdin_page.png'});

//     await browser.close();
// })();
