import * as cheerio from "cheerio";
import logger from "../../infra/logging/index.js";
import { randomDelay } from "../../infra/utils.js";

export async function BingSearch(keyword, page) {
    // Accept page object as a parameter
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`;
    logger.info(`Visiting ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    randomDelay(500, 1000);

    let currentPage = 0;
    const maxPages = 2;
    const results = [];

    while (currentPage < maxPages) {
        const html = await page.content();
        const $ = cheerio.load(html);

        $("li.b_algo").each((index, element) => {
            results.push({
                title: $(element).find("h2 a").text(),
                source: $(element).find("h2 a").attr("href"),
                description: $(element).find("div.b_caption p").text(),
                domain: $(element).find("div.tptxt div.tptt").text(),
            });
        });

        console.log(`Results from Page ${currentPage}:`, results.length);

        if (currentPage < maxPages) {
            const nextButton = await page.$("a.sb_pagN");
            if (nextButton) {
                await page.evaluate(() => document.querySelector("a.sb_pagN").scrollIntoView());
                await nextButton.click();
                await page.waitForNavigation({ waitUntil: "networkidle2" });
            } else {
                break;
            }
        }
        currentPage++;
    }

    return results;
}
