const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set headless to false to watch the login process
    const page = await browser.newPage();

    // Navigate to the custom Twitter login page
    await page.goto('https://x.com/i/flow/login', {
        waitUntil: 'networkidle2'
    });

    // Wait for the email input to be visible and type the email
    await page.waitForSelector('input[name="text"]', { visible: true });
    await page.type('input[name="text"]', ''); // Replace with your actual email

    // Wait for the "Next" button and click it
    await page.waitForSelector('div[dir="ltr"] span.css-1jxf684', { visible: true });
    await page.click('div[dir="ltr"] span.css-1jxf684');

    // Wait for the password field and enter your password
    await page.waitForSelector('input[name="password"]', { visible: true });
    await page.type('input[name="password"]', ''); // Replace with your actual password

    // Submit the login by clicking the login button with the updated selector
    await page.waitForSelector('span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3', { visible: true });
    await page.click('span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3');

    // Wait for navigation to confirm login
    // await page.waitForNavigation({
    //     waitUntil: 'networkidle0'
    // });
    await page.waitForTimeout(10000);
    // Optionally, wait for a specific element that indicates the user is logged in
   // await page.waitForSelector('your-specific-element-selector'); // Change this selector to something unique to the logged-in state

    // Save cookies to a file
    const cookies = await page.cookies();
    fs.writeFileSync('twitter_cookies.json', JSON.stringify(cookies, null, 2));

    console.log('Cookies have been saved.');
    await browser.close();
})();





// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//     const browser = await puppeteer.launch({ headless: false }); // Set headless to false to watch the login process
//     const page = await browser.newPage();

//     // Navigate to the custom Twitter login page
//     await page.goto('https://x.com/i/flow/login', {
//         waitUntil: 'networkidle2'
//     });

//     // Wait for the email input to be visible and type the email
//     await page.waitForSelector('input[name="text"]', { visible: true });
//     await page.type('input[name="text"]', 'Priyans03546867'); // Replace with your actual email

//     // Wait for the "Next" button and click it
//     await page.waitForSelector('div[dir="ltr"] span.css-1jxf684', { visible: true });
//     await page.click('div[dir="ltr"] span.css-1jxf684');

//     // Wait for the password field and enter your password
//     await page.waitForSelector('input[name="password"]', { visible: true });
//     await page.type('input[name="password"]', 'PJtwitter@1203'); // Replace with your actual password

//     // Submit the login by clicking the login button
//     await page.click('div[data-testid="LoginForm_Login_Button"]'); // Adjust if necessary for the correct selector

//     // Wait for navigation to confirm login
//     await page.waitForNavigation({
//         waitUntil: 'networkidle0'
//     });
//     await page.waitForTimeout(10000);
//     // Optionally, wait for a specific element that indicates the user is logged in
//     //await page.waitForSelector('your-specific-element-selector'); // Change this selector to something unique to the logged-in state

//     // Save cookies to a file
//     const cookies = await page.cookies();
//     fs.writeFileSync('twitter_cookies.json', JSON.stringify(cookies, null, 2));

//     console.log('Cookies have been saved.');
//     await browser.close();
// })();
