import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Delay function to pause execution for a specified time
export const delay = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
};

// Function to load cookies from a file and set them on the page
export async function loadCookies(page, cookiesPath) {
    try {
        const absolutePath = path.join(__dirname, cookiesPath);
        const cookiesString = await fs.readFile(absolutePath);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (error) {
        console.error("Failed to load cookies:", error.message);
    }
}

// Function to scroll through the page and extract data
export const getAutoScrollAndExtract = (resultExtractor) => {
    return async function (page, scrollTime = 2000) {
        let previousHeight;
        let newHeight = 0;
        let scrollCount = 0;
        let results = [];

        while (previousHeight !== newHeight) {
            previousHeight = newHeight;
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
            await delay(scrollTime);
            newHeight = await page.evaluate("document.body.scrollHeight");
            scrollCount++;

            // Extract data after each scroll
            const content = await page.content();
            
            // Scrapes the data from the content
            results = resultExtractor(content);

            console.log(`Scroll count: ${scrollCount}, New height: ${newHeight}`);
        }

        return results || [];
    };
};
