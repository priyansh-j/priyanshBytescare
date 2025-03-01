const puppeteer = require('puppeteer');
const fs = require('fs');
const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set to false to watch the login process
    const page = await browser.newPage();

    // Navigate to LinkedIn's login page
    await page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle2'
    });

    // Wait for the username and password inputs to appear on the page
    await page.waitForSelector('#username', { visible: true });
    //await page.type('#username', 'priyanshjain1203@gmail.com'); // Replace with your actual LinkedIn username/email
    await page.type('#username', 'priyansh@bytescare.com');

    await page.waitForSelector('#password', { visible: true });
    await page.type('#password', 'Dev@Bytescare'); // Replace with your actual LinkedIn password

    // Click the sign-in button
    await page.waitForSelector('button[data-litms-control-urn="login-submit"]', { visible: true });
    await page.click('button[data-litms-control-urn="login-submit"]');

    // Wait for navigation to confirm login
    // await page.waitForNavigation({
    //     waitUntil: 'networkidle0'
    // });
    await delay(90000);
    // Optionally, wait for a specific element that indicates the user is logged in
    //await page.waitForSelector('your-specific-element-selector'); // Change this selector to something unique to the logged-in state

    // Save cookies to a file
    const cookies = await page.cookies();
    fs.writeFileSync('linkedin_cookies2.json', JSON.stringify(cookies, null, 2));

    console.log('Cookies have been saved.');
    await browser.close();
})();
