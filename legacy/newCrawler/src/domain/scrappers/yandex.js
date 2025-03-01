import * as cheerio from "cheerio";
import logger from "../../infra/logging/index.js";
import { randomDelay } from "../../infra/utils.js";

export default async function scrapeYandex(page, keywords) {
    // await page.goto("https://yandex.com/search/?text=putin", {
    //     waitUntil: "domcontentloaded",
    // });
    let url = `https://yandex.com/search/?text=${keywords}&p=1`;
    await page.goto(url, {
        waitUntil: "domcontentloaded",
    });
    randomDelay(500, 1000);
    logger.info(`Visiting ${url}`);

    const content = await page.content();
    const $ = cheerio.load(content);
    let results = [];
    $("li.serp-item").each((_, element) => {
        const title = $(element).find("h2.OrganicTitle-LinkText").text().trim();
        const source = $(element).find("a.OrganicTitle-Link").attr("href");
        const description = $(element).find("span.OrganicTextContentSpan").text().trim();

        results.push({
            title,
            source,
            description,
        });
    });
    return results;
}
