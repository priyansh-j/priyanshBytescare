const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const urls = [
  
"https://www.meesho.com/s/p/4y9ojy?utm_source=s",
"https://www.meesho.com/s/p/4wtj06?utm_source=s",
"https://www.meesho.com/s/p/4y9olr?utm_source=s",
"https://www.meesho.com/s/p/4c2xqh?utm_source=s",
"https://www.meesho.com/s/p/4c2xpn?utm_source=s",
"https://www.meesho.com/s/p/6lgnac?utm_source=s",
"https://www.meesho.com/s/p/4wtorb?utm_source=s",
"https://www.meesho.com/s/p/5r01rc?utm_source=s",
"https://www.meesho.com/s/p/6tmfu2?utm_source=s",
"https://www.meesho.com/s/p/6c1gac?utm_source=s",
"https://www.meesho.com/s/p/5a0rzr?utm_source=s",
"https://www.meesho.com/s/p/3uug96?utm_source=s",
"https://www.meesho.com/s/p/3rlxtg?utm_source=s",
"https://www.meesho.com/s/p/3rapkp?utm_source=s",
"https://www.meesho.com/s/p/5jxc1o?utm_source=s",
"https://www.meesho.com/s/p/6c2p2p?utm_source=s",
"https://www.meesho.com/s/p/6hjirv?utm_source=s",
"https://www.meesho.com/s/p/6jfwh5?utm_source=s"

  // Add more URLs as needed
];

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const selector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';

    const shopInfo = $(selector).map((i, element) => {
      const Url =url;
      const seller = $(element).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
      const sellerRating = $(element).find('span.jkpPSq').text();
    //   const totalRatings = $(element).find('span.YtJFx').first().text();
    //   const followers = $(element).find('span.YtJFx').next().text();
    //   const products = $(element).find('span.YtJFx').last().text();

      return { Url,seller, sellerRating };
    }).get();

    return shopInfo;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
};

const extractData = async () => {
    const promises = urls.map(url => fetchData(url));
    const results = await Promise.all(promises);
    const flatResults = results.flat(); // Flatten the results into a single list
    fs.writeFile('output.json', JSON.stringify(flatResults, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('An error occurred while writing JSON to file:', err);
      } else {
        console.log('JSON data has been saved.');
      }
    });
  };
  
  extractData();