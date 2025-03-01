const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function loadCookies(page, cookiesPath) {
    try {
        const cookiesString = await fs.readFile(cookiesPath);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (error) {
        console.error('Failed to load cookies:', error.message);
    }
}

async function autoScrollAndExtract(page, scrollTime) {
    return await page.evaluate(async (scrollTime) => {
        const scrollInterval = 100;
        let scrollElapsed = 0;
        const scrollStep = window.innerHeight / 2;
        let extractedData = [];
        let seenUrls = new Set();

        const extractPostsFromDocument = () => {
            const posts = [];
            document.querySelectorAll('div.x78zum5.x1n2onr6.xh8yej3').forEach((elem) => {
                const postUrl = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('href');
                if (postUrl && !seenUrls.has(postUrl)) {
                    seenUrls.add(postUrl);
                    const usernameUrl = elem.querySelector('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f')?.getAttribute('href');
                    const description = elem.querySelector('div.xu06os2.x1ok221b > span > div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a > div[dir="auto"]')?.textContent;
                    const date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('aria-label');

                    if (usernameUrl || description || date) {
                        posts.push({
                            postUrl,
                            usernameUrl,
                            description,
                            date
                        });
                    }
                }
            });
            return posts;
        };

        const scroll = async () => {
            window.scrollBy(0, scrollStep);
            scrollElapsed += scrollInterval;
            if (scrollElapsed < scrollTime) {
                await new Promise(resolve => setTimeout(resolve, scrollInterval));
                const data = extractPostsFromDocument();
                extractedData.push(...data);
                await scroll();
            }
        };

        await scroll();
        return extractedData;
    }, scrollTime);
}

(async () => {
    const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.authenticate({
        username: 'package-10001',
        password: 'YcxXUKUSyPIO5MRn'
    });

    await loadCookies(page, 'fb_cookies.json');

    try {
        await page.goto('https://www.facebook.com/search/posts/?q=physics%20wallah', {
            waitUntil: 'networkidle2'
        });

        const posts = await autoScrollAndExtract(page, 10000);

        console.log(posts);
        await fs.writeFile('posts.json', JSON.stringify(posts, null, 2));

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

// async function loadCookies(page, cookiesPath) {
//     try {
//         const cookiesString = await fs.readFile(cookiesPath);
//         const cookies = JSON.parse(cookiesString);
//         await page.setCookie(...cookies);
//     } catch (error) {
//         console.error('Failed to load cookies:', error.message);
//     }
// }

// async function autoScroll(page, scrollTime) {
//     await page.evaluate(async (scrollTime) => {
//         await new Promise((resolve) => {
//             const scrollInterval = 100;
//             let scrollElapsed = 0;
//             const scrollStep = window.innerHeight / 2;

//             const scroll = () => {
//                 window.scrollBy(0, scrollStep);
//                 scrollElapsed += scrollInterval;
//                 if (scrollElapsed < scrollTime) {
//                     setTimeout(scroll, scrollInterval);
//                 } else {
//                     resolve();
//                 }
//             };

//             scroll();
//         });
//     }, scrollTime);
// }

// (async () => {
//     // Define the proxy server
//     const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     // Launch the browser without any proxy arguments directly in the launch function
//     const browser = await puppeteer.launch({ headless: false });

//     const page = await browser.newPage();

//     // Apply the proxy to the page using puppeteer-page-proxy
//     // await useProxy(page, proxyServer);

//     // Set additional options if the proxy requires authentication (not usually needed when credentials are in URL)
//     await page.authenticate({
//         username: 'package-10001',
//         password: 'YcxXUKUSyPIO5MRn'
//     });

//     // Load cookies
//     await loadCookies(page, 'fb_cookies.json');

//     // Try navigating to the desired Facebook page
//     try {
//         await page.goto('https://www.facebook.com/search/posts/?q=physics%20wallah', {
//             waitUntil: 'networkidle2'
//         });

//         // Auto-scroll the page to load more content
//         await autoScroll(page, 10000); // Scroll for 30 seconds

//         // Get the page content
//         const content = await page.content();

//         // Load content into Cheerio
//         const $ = cheerio.load(content);

//         // Extract information
//         const posts = [];
//         $('div.x78zum5.x1n2onr6.xh8yej3').each((i, elem) => {
//             const postUrl = $(elem).find('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]').attr('href');
//             const usernameUrl = $(elem).find('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f').attr('href');
//             const description = $(elem).find('div.xu06os2.x1ok221b > span > div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a > div[dir="auto"]').first().text();
//             const date = $(elem).find('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]').attr('aria-label');

//             posts.push({
//                 postUrl,
//                 usernameUrl,
//                 description,
//                 date
//             });
//         });

//         console.log(posts);
//         await fs.writeFile('posts.json', JSON.stringify(posts, null, 2));

//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'facebook_page.png' });

//         console.log('Page loaded, data extracted, and screenshot taken.');

//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();














