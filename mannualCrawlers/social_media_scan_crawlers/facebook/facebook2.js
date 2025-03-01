//final code 

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Function to load cookies from a file and set them on the page
async function loadCookies(page, cookiesPath) {
    try {
        const cookiesString = await fs.readFile(cookiesPath);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (error) {
        console.error('Failed to load cookies:', error.message);
    }
}

// Function to scroll through the page and extract post data
async function autoScrollAndExtract(page, scrollTime) {
    return await page.evaluate(async (scrollTime) => {
        const scrollInterval = 100; // Interval between each scroll (in milliseconds)
        let scrollElapsed = 0; // Time elapsed during scrolling
        const scrollStep = window.innerHeight / 2; // Amount to scroll each time
        let extractedData = []; // Array to store extracted data
        let seenUrls = new Set(); // Set to track seen URLs and avoid duplicates

        // Function to extract posts from the document
        const extractPostsFromDocument = () => {
            const posts = [];
            document.querySelectorAll('div.x78zum5.x1n2onr6.xh8yej3').forEach((elem) => {
                let postUrl, usernameUrl, description, date;

                // Check if the element contains a Reel
                if (elem.querySelector('div[data-pagelet="Reels"]')) {
                    const reelElement = elem.querySelector('div[data-pagelet="Reels"]');
                    postUrl = "https://www.facebook.com/reel/" + reelElement.querySelector('div.x6s0dn4.x18l40ae.x5yr21d.x1n2onr6.xh8yej3')?.getAttribute('data-video-id');
                    usernameUrl = elem.querySelector('a[href*="/profile.php?id="]')?.getAttribute('href').split('&')[0];
                    date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j')?.textContent;
                    description = elem.querySelector('div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a')?.textContent;
                } else {
                    // Extract regular post data
                    postUrl = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('href').split('?')[0];
                    usernameUrl = elem.querySelector('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f')?.getAttribute('href').split('?')[0];
                    description = elem.querySelector('div.xu06os2.x1ok221b > span > div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a > div[dir="auto"]')?.textContent;
                    date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('aria-label');
                }

                // Check if the post URL has been seen before to avoid duplicates
                if (postUrl && !seenUrls.has(postUrl)) {
                    seenUrls.add(postUrl);
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

        // Function to perform scrolling and data extraction
        const scroll = async () => {
            window.scrollBy(0, scrollStep); // Scroll by the defined step
            scrollElapsed += scrollInterval; // Increment the elapsed time
            if (scrollElapsed < scrollTime) { // Check if the total scroll time has been reached
                await new Promise(resolve => setTimeout(resolve, scrollInterval)); // Wait for the scroll interval
                const data = extractPostsFromDocument(); // Extract data from the document
                extractedData.push(...data); // Add extracted data to the array
                await scroll(); // Continue scrolling
            }
        };

        await scroll(); // Start scrolling
        return extractedData; // Return the extracted data
    }, scrollTime);
}

(async () => {
    const queries = [
//         "Indian Railways",
// "Indian Railways incident",
// "new project railway",
// "decan railway",
// "new route jammu kashmir",
// "railway investment",
// "rail stock",
// "railway news update"


// "Senior citizen Harish Mehta (60) and his son Jai Mehta (30). committed suicide by jumping under a running local train near Bhayandar railway station",
// "indian railways incident",
// "committe suicide on railway station "


// "RLDA invites bids for commercial development of railway land at Visakhapatnam",
// "indian railways developments ",
// "RLDA new updates on indian railways",
// "indian railways authority RLDA"

//"Indian got latent member only"

// "igl membersonly content",
// "Indian got latent member only",
// "latent special episode",
// "latent unseen content",
// "India's got latent new video",
// "India's got latent new episode",
// "latent new video",
// "latent private video",
// "IGL new video",
// "latent bonus episode",
// "INDIA’S GOT LATENT (Bonus EP 5) ft. @rohanjoshi8016 @SahilShahcomedy @ChalchitraTalks",
// "Samay raina new video",
// "latent private video",
// "igl private video",
// "latent paid video",
// "samay paid video",
// "latent members content", 

"INDIA'S GOT LATENT (BONUS EP-5)"

    ];

    const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";
    const browser = await puppeteer.launch({ headless: false }); // Launch a new browser instance

    const page = await browser.newPage(); // Open a new page

    await page.authenticate({
        username: 'package-10001',
        password: 'YcxXUKUSyPIO5MRn'
    }); // Authenticate with the proxy server

    await loadCookies(page, 'fb_cookies.json'); // Load cookies from a file

    try {
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            await page.goto(`https://www.facebook.com/search/posts/?q=${query}`, {
                waitUntil: 'networkidle2'
            }); // Navigate to the Facebook search page

            const posts = await autoScrollAndExtract(page, 50000); // Scroll and extract posts for 10 seconds

            console.log(`Posts for query '${query}':`, posts);
            await fs.writeFile(`posts_${query}.json`, JSON.stringify(posts, null, 2)); // Save extracted posts to a JSON file

            await page.screenshot({ path: `facebook_page_${query}.png` }); // Take a screenshot of the page

            console.log(`Page loaded for query '${query}', data extracted, and screenshot taken.`);
        }
    } catch (error) {
        console.error('Failed to load page:', error.message); // Log any errors
    }

    await browser.close(); // Close the browser
})();











// const puppeteer = require('puppeteer');
// const fs = require('fs').promises;

// // Function to load cookies from a file and set them on the page
// async function loadCookies(page, cookiesPath) {
//     try {
//         const cookiesString = await fs.readFile(cookiesPath);
//         const cookies = JSON.parse(cookiesString);
//         await page.setCookie(...cookies);
//     } catch (error) {
//         console.error('Failed to load cookies:', error.message);
//     }
// }

// // Function to scroll through the page and extract post data
// async function autoScrollAndExtract(page, scrollTime) {
//     return await page.evaluate(async (scrollTime) => {
//         const scrollInterval = 100; // Interval between each scroll (in milliseconds)
//         let scrollElapsed = 0; // Time elapsed during scrolling
//         const scrollStep = window.innerHeight / 2; // Amount to scroll each time
//         let extractedData = []; // Array to store extracted data
//         let seenUrls = new Set(); // Set to track seen URLs and avoid duplicates

//         // Function to extract posts from the document
//         const extractPostsFromDocument = () => {
//             const posts = [];
//             document.querySelectorAll('div.x78zum5.x1n2onr6.xh8yej3').forEach((elem) => {
//                 let postUrl, usernameUrl, description, date;

//                 // Check if the element contains a Reel
//                 if (elem.querySelector('div[data-pagelet="Reels"]')) {
//                     const reelElement = elem.querySelector('div[data-pagelet="Reels"]');
//                     postUrl = "https://www.facebook.com/reel/" + reelElement.querySelector('div.x6s0dn4.x18l40ae.x5yr21d.x1n2onr6.xh8yej3')?.getAttribute('data-video-id');
//                     usernameUrl = elem.querySelector('a[href*="/profile.php?id="]')?.getAttribute('href').split('&')[0];
//                     date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j')?.textContent;
//                     description = elem.querySelector('div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a')?.textContent;
//                 } else {
//                     // Extract regular post data
//                     postUrl = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('href').split('?')[0];
//                     usernameUrl = elem.querySelector('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f')?.getAttribute('href').split('?')[0];
//                     description = elem.querySelector('div.xu06os2.x1ok221b > span > div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a > div[dir="auto"]')?.textContent;
//                     date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('aria-label');
//                 }

//                 // Check if the post URL has been seen before to avoid duplicates
//                 if (postUrl && !seenUrls.has(postUrl)) {
//                     seenUrls.add(postUrl);
//                     if (usernameUrl || description || date) {
//                         posts.push({
//                             postUrl,
//                             usernameUrl,
//                             description,
//                             date
//                         });
//                     }
//                 }
//             });
//             return posts;
//         };

//         // Function to perform scrolling and data extraction
//         const scroll = async () => {
//             window.scrollBy(0, scrollStep); // Scroll by the defined step
//             scrollElapsed += scrollInterval; // Increment the elapsed time
//             if (scrollElapsed < scrollTime) { // Check if the total scroll time has been reached
//                 await new Promise(resolve => setTimeout(resolve, scrollInterval)); // Wait for the scroll interval
//                 const data = extractPostsFromDocument(); // Extract data from the document
//                 extractedData.push(...data); // Add extracted data to the array
//                 await scroll(); // Continue scrolling
//             }
//         };

//         await scroll(); // Start scrolling
//         return extractedData; // Return the extracted data
//     }, scrollTime);
// }

// (async () => {
//     const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     const browser = await puppeteer.launch({ headless: false }); // Launch a new browser instance

//     const page = await browser.newPage(); // Open a new page

//     await page.authenticate({
//         username: 'package-10001',
//         password: 'YcxXUKUSyPIO5MRn'
//     }); // Authenticate with the proxy server

//     await loadCookies(page, 'fb_cookies.json'); // Load cookies from a file

//     try {
//         await page.goto('https://www.facebook.com/search/posts/?q=physics%20wallah', {
//             waitUntil: 'networkidle2'
//         }); // Navigate to the Facebook search page

//         const posts = await autoScrollAndExtract(page, 10000); // Scroll and extract posts for 10 seconds

//         console.log(posts);
//         await fs.writeFile('posts.json', JSON.stringify(posts, null, 2)); // Save extracted posts to a JSON file

//         await page.screenshot({ path: 'facebook_page.png' }); // Take a screenshot of the page

//         console.log('Page loaded, data extracted, and screenshot taken.');

//     } catch (error) {
//         console.error('Failed to load page:', error.message); // Log any errors
//     }

//     await browser.close(); // Close the browser
// })();


















// const puppeteer = require('puppeteer');
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

// async function autoScrollAndExtract(page, scrollTime) {
//     return await page.evaluate(async (scrollTime) => {
//         const scrollInterval = 100;
//         let scrollElapsed = 0;
//         const scrollStep = window.innerHeight / 2;
//         let extractedData = [];
//         let seenUrls = new Set();

//         const extractPostsFromDocument = () => {
//             const posts = [];
//             document.querySelectorAll('div.x78zum5.x1n2onr6.xh8yej3').forEach((elem) => {
//                 let postUrl, usernameUrl, description, date;

//                 // Check if the element contains a Reel
//                 if (elem.querySelector('div[data-pagelet="Reels"]')) {
//                     const reelElement = elem.querySelector('div[data-pagelet="Reels"]');
//                     postUrl = "https://www.facebook.com/reel/" + reelElement.querySelector('div.x6s0dn4.x18l40ae.x5yr21d.x1n2onr6.xh8yej3')?.getAttribute('data-video-id');
//                     usernameUrl = elem.querySelector('a[href*="/profile.php?id="]')?.getAttribute('href');
//                     date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j')?.textContent;
//                     description = elem.querySelector('div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a')?.textContent;
//                 } else {
//                     postUrl = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('href');
//                     usernameUrl = elem.querySelector('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f')?.getAttribute('href');
//                     description = elem.querySelector('div.xu06os2.x1ok221b > span > div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a > div[dir="auto"]')?.textContent;
//                     date = elem.querySelector('span.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j a[aria-label]')?.getAttribute('aria-label');
//                 }

//                 if (postUrl && !seenUrls.has(postUrl)) {
//                     seenUrls.add(postUrl);
//                     if (usernameUrl || description || date) {
//                         posts.push({
//                             postUrl,
//                             usernameUrl,
//                             description,
//                             date
//                         });
//                     }
//                 }
//             });
//             return posts;
//         };

//         const scroll = async () => {
//             window.scrollBy(0, scrollStep);
//             scrollElapsed += scrollInterval;
//             if (scrollElapsed < scrollTime) {
//                 await new Promise(resolve => setTimeout(resolve, scrollInterval));
//                 const data = extractPostsFromDocument();
//                 extractedData.push(...data);
//                 await scroll();
//             }
//         };

//         await scroll();
//         return extractedData;
//     }, scrollTime);
// }

// (async () => {
//     const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     const browser = await puppeteer.launch({ headless: false });

//     const page = await browser.newPage();

//     await page.authenticate({
//         username: 'package-10001',
//         password: 'YcxXUKUSyPIO5MRn'
//     });

//     await loadCookies(page, 'fb_cookies.json');

//     try {
//         await page.goto('https://www.facebook.com/search/posts/?q=physics%20wallah', {
//             waitUntil: 'networkidle2'
//         });

//         const posts = await autoScrollAndExtract(page, 10000);

//         console.log(posts);
//         await fs.writeFile('posts.json', JSON.stringify(posts, null, 2));

//         await page.screenshot({ path: 'facebook_page.png' });

//         console.log('Page loaded, data extracted, and screenshot taken.');

//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();
