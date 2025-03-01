import * as cheerio from "cheerio";
import path from "path";
import { promises as fs } from "fs";
import { loadCookies, getAutoScrollAndExtract } from "./utils.js";

const autoScrollAndExtract = getAutoScrollAndExtract((content) => {
    const $ = cheerio.load(content);
    const results = [];

    $('div[data-testid="cellInnerDiv"]').each((index, element) => {
        const fullText = $(element).find('div[data-testid="User-Name"] span').text();
        const usernameMatch = fullText.match(/@[A-Za-z0-9_]+/);
        const link = usernameMatch ? "https://x.com/" + usernameMatch[0].replace("@", "") : null;
        const name = $(element).find('div[data-testid="User-Name"] span').first().text();
        const text = $(element).find('div[data-testid="tweetText"]').text();
        const href = $(element).find('a[href*="/status/"]').attr("href");
        const postDate = $(element).find('a[href*="/status/"] time').attr("datetime");

        if (name && link && text && href) {
            results.push({
                profile: { name, link },
                text,
                link: `https://x.com${href}`,
                postDate,
            });
        }
    });

    return results;
});

// Function to search and scrape twitter tweets based on a keyword
async function TwitterTweetSearch(page, keywords, scrollTime = 5000) {
    const cookiesPath = "../cookies/twitter_cookies.json";

    try {
        // Load cookies from a file
        await loadCookies(page, cookiesPath);

        // Navigate to the Twitter search page
        const searchUrl = `https://x.com/search?q=${encodeURIComponent(keywords)}&src=typed_query&f=top`;
        await page.goto(searchUrl, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Use the autoScrollAndExtract function to scroll and extract data
        let tweets = await autoScrollAndExtract(page, scrollTime);
        // console.log(`Tweets`, tweets);

        tweets = tweets.map(({ profile: { name }, text, link }) => ({
            title: name,
            source: link,
            description: text,
        }));

        console.log(`Tweets for keywords '${keywords}':`, tweets);

        // Create the directory if it doesn't exist
        const screenshotDir = path.resolve(process.cwd(), "./screenshots/twitter");
        await fs.mkdir(screenshotDir, { recursive: true });

        // Save the screenshot in the "screenshots/twitter" folder
        const screenshotPath = path.join(screenshotDir, `twitter_${keywords.replace(/\s+/g, "_")}.png`);
        await page.screenshot({ path: screenshotPath }); // Take a screenshot of the page

        console.log(`Page loaded for keywords '${keywords}', data extracted, and screenshot taken.`);
        return tweets;
    } catch (error) {
        console.error("Failed to load page:", error.message); // Log any errors
        throw error;
    }
}

export { TwitterTweetSearch };
