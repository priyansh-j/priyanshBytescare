import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

const PageNumber = 2;
const headers = {
    'authority': 'www.amazon.in',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'max-age=0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'upgrade-insecure-requests': '1'
};

async function fetchAndExtract(page, keyword) {
    const results = [];

    for (let pageNum = 1; pageNum <= PageNumber; pageNum++) {
        const pageUrl = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&page=${pageNum}`;
        logger.info(`Visiting ${pageUrl}`);

        // Set headers for the page
        //await page.setExtraHTTPHeaders(headers);

        await page.goto(pageUrl, { waitUntil: "networkidle2" });

        const html = await page.content();
        const $ = cheerio.load(html);

        // Check for CAPTCHA
        const blockText = $('div#infoDiv').text();
        if (blockText.includes("solve the CAPTCHA")) {
            logger.warn("CAPTCHA detected. Exiting.");
            return { state: "CAPTCHA_DETECTED", results: [] };
        }

        // Check for no results
        const noResults = $(".card-section > div > b");
        if (noResults.length > 0) {
            logger.info(`No results found for ${keyword} on page ${pageNum}`);
            break;
        }

        // Extract organic results
        $("div.s-main-slot.s-result-list > div[data-component-type='s-search-result']").each((index, element) => {
            const row = cheerio.load($(element).html());
            const title = row("span.a-size-medium.a-color-base.a-text-normal").first().text().trim() ||
                row("span.a-size-base-plus.a-color-base.a-text-normal").first().text().trim();
            const href = row("a.a-link-normal.a-text-normal").attr("href") || "";
            const asin = href.split("/dp/")[1]?.split("/")[0] || "";
            const source = `https://www.amazon.in${href.split("?")[0]}`;
            const cover = row("img.s-image").attr("src") || "";
            const mrp = row("span.a-price.a-text-price").first().text().trim().replace("₹", "₹");
            const price = row("span.a-price").first().text().trim().replace("₹", "₹");
            const author = row("div.a-row.a-size-base.a-color-secondary:contains('by ')").text().split("by ")[1]?.split("|")[0]?.trim() || "";
            const rating = row("i.a-icon-star-small > span").text().trim().split(" ")[0];
            const discount = row(".a-letter-space").text() || "";

            const item = {
                title,
                source,
                ASIN: asin,
                cover,
                mrp,
                price,
                author,
                rating,
                discount
            };

            // Create the description from all other properties except title and source
            const { title: itemTitle, source: itemSource, ...otherProperties } = item;
            results.push({
                title: itemTitle,
                source: itemSource,
                description: JSON.stringify(otherProperties)
            });
        });

        if (results.length === 0) {
            logger.info(`No data found for ${keyword} on page ${pageNum}, stopping.`);
            break;
        }
    }

    return results;
}

export async function amazonSearch(page, keyword) {
    try {
        const results = await fetchAndExtract(page, keyword);
        return results;
    } catch (error) {
        logger.error(`Error while processing keyword '${keyword}': ${error}`);
        throw error;
    }
}
