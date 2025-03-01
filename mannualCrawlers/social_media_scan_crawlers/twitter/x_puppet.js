const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Helper function to introduce delay
const delay = (time) => {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time);
  });
};

(async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();

  // Go to the Twitter search page
  const searchUrl = 'https://x.com/search?q=physics%20wallah&src=typed_query&f=top';
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // Wait for 10 seconds
  await delay(10000);

  // Get the page content
  const content = await page.content();

  // Load the content into Cheerio
  const $ = cheerio.load(content);

  // Extract tweets
  const tweets = [];
  $('article').each((index, element) => {
    const tweet = $(element).find('div[lang]').text();
    if (tweet) {
      tweets.push(tweet);
    }
  });

  // Print the tweets
  console.log(tweets);

  // Close Puppeteer
  await browser.close();
})();
