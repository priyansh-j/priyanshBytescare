# Instagram Automation with Puppeteer

This project provides scripts to log in to Instagram, save session cookies, and automatically scroll and extract post data from a specific hashtag page using Puppeteer and Cheerio.

## Prerequisites

- Node.js installed on your machine.
- Puppeteer, Cheerio, and File System (fs) packages installed.

You can install the necessary packages using npm:

```bash
npm install puppeteer cheerio fs


1.Open insta_login.js.

2.Replace the placeholder text in await page.type('input[name="username"]', ' '); and await page.type('input[name="password"]', ' '); with your actual Instagram username and password.

3.Run the script:node insta_login.js


4.Now Open instagram.js.
5.Ensure you have already run insta_login.js and have the insta_cookies.json file saved.
6.Modify the URL in await page.goto('https://www.instagram.com/explore/tags/bike', { to the hashtag page you want to scrape.
7.Run the script:node instagram.js