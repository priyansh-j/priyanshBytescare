


# twitter Automation with Puppeteer

This project provides scripts to log in to Instagram, save session cookies, and automatically scroll and extract post data from a specific hashtag page using Puppeteer and Cheerio.

## Prerequisites

- Node.js installed on your machine.
- Puppeteer, Cheerio, and File System (fs) packages installed.

You can install the necessary packages using npm:

```bash
npm install puppeteer cheerio fs


1.Open insta_login.js.

2. await page.type('input[name="text"]', 'your-email'); // Replace with your actual email
    await page.type('input[name="password"]', 'your-password'); // Replace with your actual password

3.Run the script:node x_login.js it will sace the cookies with the user info 



4.Now Open x.js.
5.Ensure you have already run x_login.js and have the twitter_cookies.json file saved.
6.Run the `twitter.js` script to scrape tweets based on the search query "physics wallah".
7.Run the script:node x.js