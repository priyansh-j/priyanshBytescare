const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};

const autoScrollAndExtract = async (page, extractData) => {
    let previousHeight;
    let newHeight = 0;
    let scrollCount = 0;

    while (previousHeight !== newHeight) {
        previousHeight = newHeight;
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await delay(2000);
        newHeight = await page.evaluate('document.body.scrollHeight');
        scrollCount++;

        // Extract data after each scroll
        await extractData(page);

        console.log(`Scroll count: ${scrollCount}, New height: ${newHeight}`);
    }
};

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
    await page.setCookie(...cookies);

    const keywords = [

// "igl membersonly content",
// "Indian got latent member only",
// "latent special episode",
// "latent unseen content",
// "India's got latent new video",
// "India's got latent new episode",
// "latent new video",
// "latent private video",
// "IGL new video",
"latent bonus episode",
"INDIA’S GOT LATENT (Bonus EP 5) ft. @rohanjoshi8016 @SahilShahcomedy @ChalchitraTalks",
"Samay raina new video",
"india got latent private video",
"india got latent members content", 

    ]; // Add more keywords as needed
    const allTweets = [];

    // Define the data extraction function
    const extractData = async (page, keyword) => {
        const content = await page.content();
        const $ = cheerio.load(content);

        $('div[data-testid="cellInnerDiv"]').each((index, element) => {
            const fullText = $(element).find('div[data-testid="User-Name"] span').text();
            const username = "https://x.com/"+fullText.match(/@[A-Za-z0-9_]+/)[0].replace('@', '');
            //const username = $(element).find('div[data-testid="User-Name"] span').text();
            const tweetText = $(element).find('div[data-testid="tweetText"]').text();
            const tweetUrl = $(element).find('a[href*="/status/"]').attr('href');
            const postDate = $(element).find('a[href*="/status/"] time').attr('datetime');

            if (username && tweetText && tweetUrl) {
                allTweets.push({
                    keyword,
                    username,
                    tweetText,
                    tweetUrl: `https://x.com${tweetUrl}`,
                    postDate
                });
            }
        });
    };

    for (const keyword of keywords) {
        try {
            const searchUrl = `https://x.com/search?q=${encodeURIComponent(keyword)}&src=typed_query&f=top`;
            await page.goto(searchUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000 
            });
            await delay(10000);

            // Use the autoScrollAndExtract function to scroll and extract data
            await autoScrollAndExtract(page, async (page) => extractData(page, keyword));

            console.log(`Data extracted for keyword: ${keyword}`);
        } catch (error) {
            console.error(`Failed to load page for keyword "${keyword}":`, error.message);
        }
    }

    console.log(allTweets);
    fs.writeFileSync('tw.json', JSON.stringify(allTweets, null, 2));

    await page.screenshot({ path: 'twitter.png' });

    console.log('Page loaded, data extracted, and screenshot taken.');

    await browser.close();
})();






























// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const delay = (time) => {
//     return new Promise(function(resolve) { 
//       setTimeout(resolve, time);
//     });
// };

// const autoScrollAndExtract = async (page, extractData) => {
//     let previousHeight;
//     let newHeight = 0;
//     let scrollCount = 0;

//     while (previousHeight !== newHeight) {
//         previousHeight = newHeight;
//         await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
//         await delay(2000);
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

//     const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
//     await page.setCookie(...cookies);

//     const tweets = [];

//     // Define the data extraction function
//     const extractData = async (page) => {
//         const content = await page.content();
//         const $ = cheerio.load(content);

//         $('div[data-testid="cellInnerDiv"]').each((index, element) => {
//             const username = $(element).find('div[data-testid="User-Name"] span').text();
//             const tweetText = $(element).find('div[data-testid="tweetText"]').text();
//             const tweetUrl = $(element).find('a[href*="/status/"]').attr('href');
//             const postDate = $(element).find('a[href*="/status/"] time').attr('datetime');

//             if (username && tweetText && tweetUrl) {
//                 tweets.push({
//                     username,
//                     tweetText,
//                     tweetUrl: `https://x.com${tweetUrl}`,
//                     postDate
//                 });
//             }
//         });
//     };

//     try {
//         await page.goto('https://x.com/search?q=physics%20wallah&src=typed_query&f=top', {
//             waitUntil: 'networkidle2',
//             timeout: 60000 
//         });
//         await delay(10000);

//         // Use the autoScrollAndExtract function to scroll and extract data
//         await autoScrollAndExtract(page, extractData);

//         console.log(tweets);
//         fs.writeFileSync('tw.json', JSON.stringify(tweets, null, 2));

//         await page.screenshot({ path: 'twitter.png' });

//         console.log('Page loaded, data extracted, and screenshot taken.');
//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();











// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const useProxy = require('puppeteer-page-proxy');


// const delay = (time) => {
//     return new Promise(function(resolve) { 
//       setTimeout(resolve, time);
//     });
//   };

//   const autoScroll = async (page) => {
//     await page.evaluate(async () => {
//       await new Promise((resolve, reject) => {
//         var totalHeight = 0;
//         var distance = 100;
//         var timer = setInterval(() => {
//           var scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, distance);
//           totalHeight += distance;
  
//           if(totalHeight >= scrollHeight){
//             clearInterval(timer);
//             resolve();
//           }
//         }, 100);
//       });
//     });
//   };


// (async () => {
//     // Define the proxy server
//     //const proxyServer = "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";

//     // Launch the browser without any proxy arguments directly in the launch function
//     const browser = await puppeteer.launch({headless:false});

//     const page = await browser.newPage();

//     // Apply the proxy to the page using puppeteer-page-proxy
//     //await useProxy(page, proxyServer);

//     // Set additional options if the proxy requires authentication (not usually needed when credentials are in URL)
//     // await page.authenticate({
//     //     username: 'package-10001',
//     //     password: 'YcxXUKUSyPIO5MRn'
//     // });

//     // Load cookies from the JSON file
//     const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));

//     // Set cookies in the page
//     await page.setCookie(...cookies);

//     // Try navigating to LinkedIn's profile page
//     try {
//         await page.goto('https://x.com/search?q=physics%20wallah&src=typed_query&f=top', {
//             waitUntil: 'networkidle2',
//             timeout: 60000 
//         });
//         await delay(10000);

//         await autoScroll(page);
//         content = await page.content();
        
// const $ = cheerio.load(content);
//         const tweets = [];
//   $    ('div[data-testid="cellInnerDiv"]').each((index, element) => {
//     const username = $(element).find('div[data-testid="User-Name"] span').text();
//     const tweetText = $(element).find('div[data-testid="tweetText"]').text();
//     const tweetUrl = $(element).find('a[href*="/status/"]').attr('href');
//     const postDate = $(element).find('a[href*="/status/"] time').attr('datetime');

//     if (username && tweetText && tweetUrl) {
//       tweets.push({
//         username,
//         tweetText,
//         tweetUrl: `https://x.com${tweetUrl}`,
//         postDate
//       });
//     }
//   });

//   // Print the tweets
//   console.log(tweets);
//   fs.writeFileSync('tw.json', JSON.stringify(tweets, null, 2));


//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'twitter.png' });

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
//     const browser = await puppeteer.launch();

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
//         await page.goto('https://x.com/Priyans03546867', {
//             waitUntil: 'networkidle2'
//         });

//         await page.waitForTimeout(5000);

//         // Optionally, take a screenshot
//         await page.screenshot({ path: 'twitter_page.png' });

//         console.log('Page loaded and screenshot taken.');

//     } catch (error) {
//         console.error('Failed to load page:', error.message);
//     }

//     await browser.close();
// })();



// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//     const browser = await puppeteer.launch(); // Set headless to false to watch the process
//     const page = await browser.newPage();

//     // Load cookies from 'twitter_cookies.json'
//     if (fs.existsSync('twitter_cookies.json')) {
//         const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
//         for (const cookie of cookies) {
//             await page.setCookie(cookie);
//         }
//         console.log('Cookies loaded successfully.');
//     } else {
//         console.log('No cookie file found. Please ensure you are logged in and cookies are saved.');
//         await browser.close();
//         return; // Stop execution if no cookies are found
//     }

//     // Navigate to the specific Twitter profile
//     await page.goto('https://x.com/Priyans03546867', {
//         waitUntil: 'networkidle2'
//     });

//     // Optional: perform operations or checks on the profile page
//     // For example, wait for a specific element that indicates the page has fully loaded
//     //await page.waitForSelector('some-specific-element-selector', {timeout: 10000}); // Adjust the selector as needed
//     await page.waitForTimeout(10000);
//     // Optional: Save a screenshot for verification
//     await page.screenshot({path: 'twitter_page.png'});

//     console.log('Navigation to profile page complete.');
//     await browser.close();
// })();
