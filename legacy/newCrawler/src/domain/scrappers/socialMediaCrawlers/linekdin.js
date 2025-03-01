import * as cheerio from "cheerio";
import path from "path";
import { promises as fs } from "fs";

// Function to load cookies from a JSON file
async function loadCookies(page, cookiesPath) {
    try {
        const cookies = JSON.parse(await fs.readFile(cookiesPath, "utf8"));
        await page.setCookie(...cookies);
        console.log("Cookies loaded successfully.");
    } catch (error) {
        console.error("Failed to load cookies:", error.message);
        throw error;
    }
}

// Function to auto-scroll the page and extract content
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

// Function to parse LinkedIn content
const parseLinkedInContent = (content) => {
    const $ = cheerio.load(content);
    const results = [];

    $('div.feed-shared-update-v2').each((index, element) => {
        const profileUrl = $(element).find('a.update-components-actor__image').attr('href');
        const postUrl = $(element).find('a.update-components-article__image-link').attr('href');
        const postDescription = $(element).find('div.feed-shared-update-v2__description-wrapper span.text-view-model').text();

        if (profileUrl && postUrl && postDescription) {
            results.push({
                profileUrl: `https://www.linkedin.com${profileUrl}`,
                postUrl: `https://www.linkedin.com${postUrl}`,
                postDescription,
            });
        }
    });

    return results;
};

// Function to search and scrape LinkedIn posts based on a keyword
async function LinkedInPostSearch(page, keyword) {
    const scrollTime = 5000;
    const cookiesPath = "../cookies/linkedin_cookies.json";

    try {
        // Load cookies from a file
        await loadCookies(page, cookiesPath);

        // Navigate to the LinkedIn search page
        const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Use the autoScrollAndExtract function to scroll and extract data
        const posts = await autoScrollAndExtract(page, scrollTime, parseLinkedInContent);

        const formattedPosts = posts.map(({ profileUrl, postUrl, postDescription }) => ({
            title: profileUrl,
            // profile: profileUrl,
            source: postUrl,
            description: postDescription,
        }));

        console.log(`Posts for keywords '${keywords}':`, formattedPosts);

        // Create the directory if it doesn't exist
        const screenshotDir = path.resolve(process.cwd(), "./screenshots/linkedin");
        await fs.mkdir(screenshotDir, { recursive: true });

        // Save the screenshot in the "screenshots/linkedin" folder
        const screenshotPath = path.join(screenshotDir, `linkedin_${keywords.replace(/\s+/g, "_")}.png`);
        await page.screenshot({ path: screenshotPath }); // Take a screenshot of the page

        console.log(`Page loaded for keywords '${keyword}', data extracted, and screenshot taken.`);
        return formattedPosts;
    } catch (error) {
        console.error("Failed to load page:", error.message); // Log any errors
        throw error;
    }
}

export { LinkedInPostSearch };
