import * as cheerio from "cheerio";
import path from "path";
import { promises as fs } from "fs";

// Function to load cookies from a JSON file
async function loadCookies(page, cookiesPath) {
    try {
        const cookiesString = await fs.readFile(cookiesPath, "utf8");
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log("Cookies loaded successfully.");
    } catch (error) {
        console.error("Failed to load cookies:", error.message);
        throw error;
    }
}

// Function to auto-scroll the page and extract data
async function autoScrollAndExtract(page, scrollTime, extractFunction) {
    const extractData = async () => {
        const content = await page.content();
        return extractFunction(content);
    };

    let results = [];
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
        let previousHeight;
        while (true) {
            results = await extractData();

            previousHeight = await page.evaluate(() => document.body.scrollHeight);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await delay(2000);

            const currentHeight = await page.evaluate(() => document.body.scrollHeight);
            if (currentHeight === previousHeight) break;
        }

        await delay(scrollTime); // Additional delay for final extraction
        results = await extractData(); // Extract data after the last scroll
    } catch (error) {
        console.error("Failed during auto-scroll:", error.message);
        throw error;
    }

    return results;
}

// Function to parse Facebook content
const parseFacebookContent = (content) => {
    const $ = cheerio.load(content);
    const results = [];
    const seenUrls = new Set();

    $('div.x78zum5.x1n2onr6.xh8yej3').each((index, element) => {
        let source, title, description, date;

        // Check for Reels or regular posts
        if ($(element).find('div[data-pagelet="Reels"]').length) {
            const reelElement = $(element).find('div[data-pagelet="Reels"]');
            source = "https://www.facebook.com/reel/" + reelElement.find('div.x6s0dn4.x18l40ae.x5yr21d.x1n2onr6.xh8yej3').attr('data-video-id');
            title = $(element).find('a[href*="/profile.php?id="]').attr('href');
            description = $(element).find('div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.x126k92a').text();
            date = $(element).find('span.x4k7w5x.x1h91t0o').text();
        } else {
            source = $(element).find('span.x4k7w5x a[aria-label]').attr('href');
            title = $(element).find('a[href*="/profile.php"]').attr('href');
            description = $(element).find('div.xu06os2.x1ok221b > span > div.x126k92a > div[dir="auto"]').text();
            date = $(element).find('span.x4k7w5x a[aria-label]').attr('aria-label');
        }

        if (source && !seenUrls.has(source)) {
            seenUrls.add(source);
            results.push({
                source,
                title,
                description,
                //date,
            });
        }
    });

    return results;
};

// Function to search and scrape Facebook posts based on a keyword
async function FacebookPostSearch(page, keywords) {
    const scrollTime = 5000;
    const cookiesPath = "../cookies/fb_cookies.json";

    try {
        // Load cookies from a file
        await loadCookies(page, cookiesPath);

        // Navigate to the Facebook search page
        const searchUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(keywords)}`;
        await page.goto(searchUrl, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Use the autoScrollAndExtract function to scroll and extract data
        const posts = await autoScrollAndExtract(page, scrollTime, parseFacebookContent);

        console.log(`Posts for keywords '${keywords}':`, posts);

        // Create the directory if it doesn't exist
        const screenshotDir = path.resolve(process.cwd(), "./screenshots/facebook");
        await fs.mkdir(screenshotDir, { recursive: true });

        // Save the screenshot in the "screenshots/facebook" folder
        const screenshotPath = path.join(screenshotDir, `facebook_${keywords.replace(/\s+/g, "_")}.png`);
        await page.screenshot({ path: screenshotPath }); // Take a screenshot of the page

        console.log(`Page loaded for keywords '${keywords}', data extracted, and screenshot taken.`);
        return posts;
    } catch (error) {
        console.error("Failed to load page:", error.message); // Log any errors
        throw error;
    }
}

export { FacebookPostSearch };
