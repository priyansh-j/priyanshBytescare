const axios = require('axios');
const cheerio = require('cheerio');

// Function to extract username from a single URL
async function extractUsername(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const metaTag = $('meta[name="twitter:title"]').attr('content');
    const usernameMatch = metaTag.match(/@\w+/);
    
    if (usernameMatch) {
      const username = usernameMatch[0].substring(1); // Remove the @ symbol
      return `https://www.instagram.com/${username}`;
    } else {
      throw new Error('Username not found');
    }
  } catch (error) {
    console.error(`Error fetching URL ${url}: ${error.message}`);
    return null;
  }
}

// Function to extract usernames from multiple URLs
async function extractUsernames(urls) {
  const results = await Promise.all(urls.map(async (url) => {
    const username = await extractUsername(url);
    return { url, username };
  }));

  return results.filter(result => result.username !== null);
}

// Example usage
const urls = [
  'https://www.instagram.com/p/C9TrIrSuF02/',
  "https://www.instagram.com/p/C9R__LypZxZ/",
  "https://www.instagram.com/p/C9S8ozDITRF/"

  // Add more URLs here
];

extractUsernames(urls).then(results => {
  console.log('Results:', results);
}).catch(error => {
  console.error('Error:', error.message);
});
























