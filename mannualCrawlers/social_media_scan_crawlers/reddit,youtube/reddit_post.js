const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');


// Function to auto-scroll the page
const autoScroll = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
  
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  };

// Function to fetch and extract data from the given URL
const fetchData = async () => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://www.reddit.com/r/JEENEETards/comments/16tbrcw/pw_is_emotion/', { waitUntil: 'networkidle2' });

    
    await autoScroll(page);
    // Get the HTML content of the page
    const content = await page.content();

    // Load the HTML into cheerio
    const $ = cheerio.load(content);

    // Extract the desired information from all matching elements
    const commentSelector = 'shreddit-comment';
    const comments = $(commentSelector);

    // Array to hold the extracted data
    const commentData = [];

    comments.each((index, element) => {
      const commentElement = $(element);
      const commentAuthor = "https://www.reddit.com/user/"+commentElement.attr('author');
      const commentText = commentElement.find('div[id*="comment-rtjson-content"] p').text();
      const commentScore = commentElement.attr('score');
      const commentTime = commentElement.find('faceplate-timeago time').attr('datetime');

      // Push the extracted information into the array
      commentData.push({
        Username: commentAuthor,
        Comment: commentText,
        Likes: commentScore,
        Time: commentTime,
      });
    });


       // Close the browser
       await browser.close();

    // Save the extracted data to a JSON file
    fs.writeFileSync('comments.json', JSON.stringify(commentData, null, 2));
    console.log('Data has been saved to comments.json');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// URL to scrape
//const url = 'https://www.reddit.com/r/JEENEETards/comments/16tbrcw/pw_is_emotion/';

// Fetch and extract data
fetchData();
















// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// // Function to fetch and extract data from the given URL
// const fetchData = async (url) => {
//   try {
//     // Make a request to the URL
//     const response = await axios.get(url);
    
//     fs.writeFileSync('response.html', response.data);
//     console.log('HTML response has been saved to response.html');
//     // Load the HTML into cheerio
//     const $ = cheerio.load(response.data);

//     // Extract the desired information from all matching elements
//     const commentSelector = 'shreddit-comment';
//     const comments = $(commentSelector);

//     // Array to hold the extracted data
//     const commentData = [];

//     comments.each((index, element) => {
//       const commentElement = $(element);
//       const commentAuthor = commentElement.attr('author');
//       const commentText = commentElement.find('div[id*="comment-rtjson-content"] p').text();
//       const commentScore = commentElement.attr('score');
//       const commentTime = commentElement.find('faceplate-timeago time').attr('datetime');

//       // Push the extracted information into the array
//       commentData.push({
//         author: commentAuthor,
//         text: commentText,
//         score: commentScore,
//         time: commentTime,
//       });
//     });

//     // Save the data to a JSON file
//     fs.writeFileSync('comments.json', JSON.stringify(commentData, null, 2));

//     console.log('Data has been saved to comments.json');
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// };

// // URL to scrape
// const url = 'https://www.reddit.com/r/JEENEETards/comments/16tbrcw/pw_is_emotion/';

// // Fetch and extract data
// fetchData(url);
