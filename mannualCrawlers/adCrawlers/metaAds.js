const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

// Function to scrape Facebook Ads Library based on a keyword
async function scrapeFacebookAds(keyword) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Construct the URL with the query
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&q=${encodeURIComponent(keyword)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scroll down to load more content
    for (let i = 0; i < 2; i++) {
        let previousHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Extract data from the page
    const extractedData = await page.evaluate(() => {
        let results = [];
        const containers = document.querySelectorAll('div._7jvw');

        containers.forEach(container => {
            const libraryId = container.querySelector('span.x8t9es0')?.innerText.replace('Library ID: ', '').trim();
            const status = container.querySelector('span.x8t9es0.x1i64zmx')?.innerText.trim();
            const startDateSpan = document.evaluate(
                ".//span[contains(text(), 'Started running on')]",
                container,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            const startDate = startDateSpan ? startDateSpan.innerText.replace('Started running on ', '').trim() : '';
            const AdLink = `https://www.facebook.com/ads/library/?active_status=all&ad_type=political_and_issue_ads&country=IN&id=${libraryId}`;
            const Profile_Name = container.querySelector('a.xt0psk2 span.x8t9es0')?.innerText.trim();
            const profileUrl = container.querySelector('a.xt0psk2.x1hl2dhg')?.href;
            const profileImage = container.querySelector('img._8nqq.img')?.src;

            results.push({ libraryId, status, startDate, AdLink, Profile_Name, profileUrl, profileImage });
        });
        return results;
    });

    // Save data to a JSON file
    const fileName = `results_${keyword.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(fileName, JSON.stringify(extractedData, null, 2));
    console.log(`Data has been saved to ${fileName}`);

    await page.close();
    await browser.close();
}

// Example usage
scrapeFacebookAds('rachna ranade');