const puppeteer = require('puppeteer');
const fs = require('fs');

const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};

(async () => {
    const browser = await puppeteer.launch({headless: false}); // Set to false to watch the process
    const page = await browser.newPage();

    // Navigate to Facebook's login page
    await page.goto('https://www.facebook.com/', {
        waitUntil: 'networkidle2'
    });

    // Wait for the email input and password input to appear on the page
    await page.waitForSelector('input[name="email"]');
    await page.waitForSelector('input[name="pass"]');

    // Type credentials into the login form
    await page.type('input[name="email"]', 'priyansh.jain.359126'); // Replace with your email
    await page.type('input[name="pass"]', 'PJrocks@1203'); // Replace with your password

    // Click the login button
    await page.click('button[name="login"]');
    
    // Wait for some element that only appears when logged in (e.g., your profile icon)
    // await page.waitForSelector('some-logged-in-selector', {
    //     timeout: 10000 // Wait for up to 10 seconds
    // });

    await delay(10000);

    // Save cookies to a file
    const cookies = await page.cookies();
    fs.writeFileSync('fb_cookies.json', JSON.stringify(cookies, null, 2));

    console.log('Cookies have been saved.');
    await browser.close();
})();
