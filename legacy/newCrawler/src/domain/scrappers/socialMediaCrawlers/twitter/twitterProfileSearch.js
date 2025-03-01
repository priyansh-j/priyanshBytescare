import * as cheerio from "cheerio";
import path from "path";
import { promises as fs } from "fs";
import { loadCookies, getAutoScrollAndExtract } from "./utils.js";

const autoScrollAndExtract = getAutoScrollAndExtract((content) => {
    const $ = cheerio.load(content);
    const results = [];

    $('div[data-testid="cellInnerDiv"]').each((index, element) => {
        const innerText = $(element).find('[data-testid="UserCell"] > div > div:nth-child(2) > div').text();
        const parts = innerText.split("@");

        // It is name e.g., Elon Musk
        const name = parts[0];
        // username: elonmusk
        const username = parts[1];
        const link = `https://x.com/${username}`;

        const elem = $(element).find(
            'div[dir="auto"][class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-1h8ys4a r-1jeg54m"]'
        );
        let description = elem.text();

        if (name && link && description) {
            results.push({
                title: name,
                source: link,
                description,
            });
        }
    });

    return results;
});

// Scrape twitter profiles based on a keyword
async function TwitterProfileSearch(page, query, scrollTime = 5000) {
    const cookiesPath = "../cookies/twitter_cookies.json";

    try {
        // Load cookies from a file
        await loadCookies(page, cookiesPath);

        // Navigate to the Twitter search page
        const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=user`;
        await page.goto(searchUrl, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Use the autoScrollAndExtract function to scroll and extract data
        const profiles = await autoScrollAndExtract(page, scrollTime);

        console.log(`Profiles for query '${query}':`, profiles);

        // Create the directory if it doesn't exist
        const screenshotDir = path.resolve(process.cwd(), "./screenshots/twitter");
        await fs.mkdir(screenshotDir, { recursive: true });

        // Save the screenshot in the "screenshots/twitter" folder
        const screenshotPath = path.join(screenshotDir, `twitter_${query.replace(/\s+/g, "_")}.png`);
        await page.screenshot({ path: screenshotPath }); // Take a screenshot of the page

        console.log(`Page loaded for query '${query}', data extracted, and screenshot taken.`);
        return profiles;
    } catch (error) {
        console.error("Failed to load page:", error.message); // Log any errors
        throw error;
    }
}

export { TwitterProfileSearch };
