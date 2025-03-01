const puppeteer = require('puppeteer');
const fs = require('fs');


const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
};
(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    // Load cookies if they exist
    if (fs.existsSync('insta_cookies.json')) {
        const cookies = JSON.parse(fs.readFileSync('insta_cookies.json', 'utf8'));
        for (const cookie of cookies) {
            await page.setCookie(cookie);
        }
    }

    await page.goto('https://www.instagram.com/');
    await delay(10000);

    // Check if login is needed
    if (await page.$('input[name="username"]')) {
        await page.type('input[name="username"]', 'dev_bytescare');               // insta username 
        await page.type('input[name="password"]', 'Dev@bytescare');    // insta password 
        await page.click('button[type="submit"]');
        // Wait for some selector that confirms the home page is loaded
      
        await delay(10000);

        // Save cookies after login
        const cookies = await page.cookies();
        fs.writeFileSync('insta_cookies.json', JSON.stringify(cookies));  // it will save the page cookies with user info in the json file 
    }

    // Now do something, like generating a PDF

    await browser.close();
})();
