const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};

(async () => {
    // Launch the browser without any proxy arguments directly in the launch function
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    // Load cookies from a JSON file and set them
    async function loadCookies(page, cookiesPath) {
        const cookiesString = await fs.readFile(cookiesPath);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    }

    // Load cookies (if any logic to load cookies here)
    await loadCookies(page, 'fb_cookies.json');

    // Function to auto-scroll for a specified amount of time
    async function autoScroll(page, scrollTime) {
        await page.evaluate(async (scrollTime) => {
            await new Promise((resolve) => {
                const scrollInterval = 100;
                let scrollElapsed = 0;
                const scrollStep = window.innerHeight / 2;

                const scroll = () => {
                    window.scrollBy(0, scrollStep);
                    scrollElapsed += scrollInterval;
                    if (scrollElapsed < scrollTime) {
                        setTimeout(scroll, scrollInterval);
                    } else {
                        resolve();
                    }
                };

                scroll();
            });
        }, scrollTime);
    }

    // Try navigating to Facebook's search page
    try {
        await page.goto('https://www.facebook.com/search/posts/?q=physics%20wallah', {
            waitUntil: 'networkidle2'
        });

        // Scroll for 10 seconds (10000 milliseconds)
        await autoScroll(page, 10000);

        // Wait for a short time to ensure the last scroll action is completed
        await delay(2000);

        // Get the page content and load it into Cheerio
        const content = await page.content();
        const $ = cheerio.load(content);

        const results = [];
        $('div.x78zum5.x1n2onr6.xh8yej3').each((i, element) => {
            if ($(element).find('div[data-pagelet="Reels"]').length > 0) {
                const reelElement = $(element).find('div[data-pagelet="Reels"]');
                const postUrl = "https://www.facebook.com/reel/"+reelElement.find('div.x6s0dn4.x18l40ae.x5yr21d.x1n2onr6.xh8yej3').attr('data-video-id');
                const usernameUrl = $(element).find('a[href*="/profile.php?id="]').attr('href')
                //const usernameLink = $(element).find('a[aria-label="See owner profile"]').attr('href');
                const date = $(element).find('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j').text();
                const description = $(element).find('div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a').text();
                // Extract date using regex
                //const datePosted = dateText.match(/^\d{1,2} \w+ \d{4}/)?.[0];

                if ( postUrl|| usernameUrl || date || description) {
                    results.push({
                        postUrl,
                            usernameUrl,
                            description,
                            date
                    });
                }
            }
        });

        // Optionally, save results to a file
        await fs.writeFile('facebook_data.json', JSON.stringify(results, null, 2));

        // Optionally, take a screenshot
        await page.screenshot({ path: 'facebook_page.png' });

        console.log('Page loaded, data extracted, and screenshot taken.');
    } catch (error) {
        console.error('Failed to load page:', error.message);
    }

    await browser.close();
})();










// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs').promises;

// const delay = (time) => {
//     return new Promise(function(resolve) { 
//       setTimeout(resolve, time);
//     });
// };

// (async () => {
//     // Launch the browser without any proxy arguments directly in the launch function
//     const browser = await puppeteer.launch({ headless: false });

//     const page = await browser.newPage();

//     // Load cookies from a JSON file and set them
//     async function loadCookies(page, cookiesPath) {
//         const cookiesString = await fs.readFile(cookiesPath);
//         const cookies = JSON.parse(cookiesString);
//         await page.setCookie(...cookies);
//     }

//     // Load cookies (if any logic to load cookies here)
//     await loadCookies(page, 'fb_cookies.json');

//     // Function to auto-scroll for a specified amount of time
//     async function autoScroll(page, scrollTime) {
//         await page.evaluate(async (scrollTime) => {
//             await new Promise((resolve) => {
//                 const scrollInterval = 100;
//                 let scrollElapsed = 0;
//                 const scrollStep = window.innerHeight / 2;

//                 const scroll = () => {
//                     window.scrollBy(0, scrollStep);
//                     scrollElapsed += scrollInterval;
//                     if (scrollElapsed < scrollTime) {
//                         setTimeout(scroll, scrollInterval);
//                     } else {
//                         resolve();
//                     }
//                 };

//                 scroll();
//             });
//         }, scrollTime);
//     }

//     // Try navigating to Facebook's search page
//     try {
//         await page.goto('https://www.facebook.com/search/posts/?q=physics%20wallah', {
//             waitUntil: 'networkidle2'
//         });

//         // Scroll for 10 seconds (10000 milliseconds)
//         await autoScroll(page, 5000);

//         // Wait for a short time to ensure the last scroll action is completed
//         await delay(2000);

//         // Get the page content and load it into Cheerio
//         const content = await page.content();
//         const $ = cheerio.load(content);

//         const results = [];
//         $('div.x78zum5.x1n2onr6.xh8yej3').each((i, element) => {
//             if ($(element).find('div[data-pagelet="Reels"]').length > 0) {
//                 const reelLink = $(element).find('x6s0dn4.x18l40ae.x5yr21d.x1n2onr6.xh8yej3').attr('data-video-id');
//                 const usernameLink = $(element).find('a[aria-label="See owner profile"]').attr('href');
//                 const dateText = $(element).find('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j').text();
//                 const description = $(element).find('div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a').text();
//                 // Extract date using regex
//                 const datePosted = dateText.match(/^\d{1,2} \w+ \d{4}/)?.[0];

//                 if (reelLink && usernameLink && datePosted && description) {
//                     results.push({
//                         reelLink,
//                         usernameLink,
//                         datePosted,
//                         description
//                     });
//                 }
//             }
//         });

        

//         // Optionally, save results to a file
//         await fs.writeFile('facebook_data.json', JSON.stringify(results, null, 2));

//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'facebook_page.png' });

//         console.log('Page loaded, data extracted, and screenshot taken.');
//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();









// const reelLink = $(element).find('a[href*="/reel/"]').attr('href');
//             const userLink = $(element).find('a[href*="/profile.php?id="]').attr('href') 
//             const datePosted = $(element).find('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j').text()
//             const description = $(element).find('span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a').text();