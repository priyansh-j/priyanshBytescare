import * as cheerio from "cheerio";
import logger from "../../infra/logging/index.js";
import { randomDelay } from "../../infra/utils.js";

export default async function scrapeDuckDuckGo(page, keywords, url = "https://duckduckgo.com/?q=", maxPages = 2) {
    let searchUrl = `${url}${keywords.split(" ").join("+")}&t=ha&va=j&ia=web`;
    logger.info(`Visiting url -> ${searchUrl}`);
    await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
    });
    randomDelay(500, 1000);
    let currentPage = 1;
    while (currentPage < maxPages) {
        await page.waitForSelector('button[id="more-results"]');
        await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 'button[id="more-results"]');
        await page.click('button[id="more-results"]');
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        currentPage += 1;
    }
    let content = await page.content();

    const $ = cheerio.load(content);

    let organic_results = $('li[data-layout="organic"]');

    if (organic_results.length === 0) {
        console.log(`No organic duckduckgo results found for keyword: ${key}`);
    }
    let results = [];

    organic_results.each((_, element) => {
        let row_selector = cheerio.load($(element).html());
        let serp_obj = {
            source: row_selector('a[data-testid="result-title-a"]').attr("href") || "",
            title: row_selector('a[data-testid="result-title-a"]').text().trim(),
            description: row_selector('div[data-result="snippet"]').text().trim(),
        };
        results.push(serp_obj);
    });
    return results;
}
