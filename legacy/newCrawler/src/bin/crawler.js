import { Cluster } from "puppeteer-cluster";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import dotenv from "dotenv";
dotenv.config();

// Imported for initialization
import _mongo from "../infra/db/mongo/index.js";
import _mysql from "../infra/db/index.js";

import RedisQueue from "../infra/queue/index.js";
import AssetsRepo from "../infra/repo/assets.js";
import SourcesRepo from "../infra/repo/sources.js";
import ScansRepo from "../infra/repo/scan.js";

import scrape from "../domain/scrappers/index.js";
import SaveResults from "../domain/usecases/saveResults/index.js";

import logger from "../infra/logging/index.js";

let queue = new RedisQueue();

let USE_PROXY = process.env.USE_PROXY === "true" ? true : false;
let PROXY_HOST = process.env.PROXY_HOST;
let PROXY_USERNAME = process.env.PROXY_USERNAME;
let PROXY_PASSWORD = process.env.PROXY_PASSWORD;

/**
 *
 * TODO: Create an interface for page.
 *
 * @param {*} page - Puppeteer ge instance
 * @param {*} data - keyword data we got from the redis stream
 *
 * 1. Scrape platforms for keywords
 * 2. Filter them
 * 3. Save the results in the db
 * 4. Ack the message id.
 *
 * Example keywords
 * {
 *      "assetId":"59819041-4e01-37b9-b526-ca125d783204",
 *      "assetType": "book",
 *      "keywordId":"5ddde5cf-bd09-3ebf-832f-32e569002693",
 *      "keyword":"accounting and financial management for bankers book pdf download",
 *      "type":"book",
 *      "platform":"googleSearch"
 * }
 *
 * */
async function scrapePlatform(page, data) {
    let { keyword: keywordData } = data;
    let { platform, keyword, assetId, keywordId, scanId } = keywordData;
    try {
        let results = await scrape(page, keyword, platform);
        //console.log(results);
        if (!!results === false || results.length === 0) {
            logger.info(`[GOT_NO_RESULTS] for scanId -> ${scanId} keywordId -> ${keywordId} platform -> ${platform}`);
        } else {
            logger.info(`Got ${results.length} results for keyword:${keywordId} platform:${platform} scan:${scanId}`);
            results = results.filter((el) => {
                try {
                    new URL(el.source);
                } catch {
                    return false;
                }
                return true;
            });
            let saveResultsUsecase = new SaveResults(new AssetsRepo(), new SourcesRepo(), new ScansRepo());
            await saveResultsUsecase.exec({
                scanId,
                assetId,
                keywordId,
                platform,
                results,
            });
        }
    } catch (error) {
        console.log(error);
        if (error.message.split("GOT_NO_RESULTS").length === 0) {
            throw error;
        }
    }
}

async function scan(BROWSERS_NUM = 4) {
    logger.info("Starting scan");

    // let perBrowserOptions = [];
    // let port = 9000;
    // for (let index = 0; index < BROWSERS_NUM; index++) {
    //     let args = ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1361,926"];
    //     if (USE_PROXY) {
    //         args.push(`--proxy-server=${PROXY_HOST}:${port}`);
    //     }
    //     perBrowserOptions.push({
    //         headless: false,
    //         args,
    //     });
    //     // port += 1;
    // }

    // let cluster = await Cluster.launch({
    //     puppeteer,
    //     concurrency: Cluster.CONCURRENCY_BROWSER,
    //     sameDomainDelay: 4000,
    //     monitor: false,
    //     maxConcurrency: BROWSERS_NUM,
    //     retryLimit: 3,
    //     perBrowserOptions,
    // });

    let args = ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1361,926"];
    if (USE_PROXY) {
        args.push(`--proxy-server=${PROXY_HOST}:9000`);
    }
    let cluster = await Cluster.launch({
        puppeteer,
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        sameDomainDelay: 4000,
        monitor: false,
        maxConcurrency: BROWSERS_NUM,
        retryLimit: 3,
        retryDelay: 10_000,
        puppeteerOptions: {
            headless: true,
            args,
        },
    });

    await cluster.task(async ({ page, data, worker }) => {
        try {
            if (USE_PROXY) {
                await page.authenticate({
                    username: PROXY_USERNAME,
                    password: PROXY_PASSWORD,
                });
            }

            logger.info(
                `[WORKER_${worker.id}]-> processing keyword ${data.keyword.keywordId} for scan ${data.keyword.scanId} and platform ${data.keyword.platform} `
            );
            await scrapePlatform(page, data);
        } catch (error) {
            console.log(error);
            logger.error(`Error processing ${error.message}`);
            throw error;
        }
    });

    // This is used to manage wait time for the same domain in puppeteer cluster.
    const platformDomainMap = {
        googleSearch: "https://www.google.com",
        bing: "https://www.bing.com",
        duckduckgo: "https://duckduckgo.com",
        yandex: "https://yandex.com",
        twitter: "https://x.com",
        instagramPost:"https://www.instagram.com/",
        facebookPost:"https://www.facebook.com/",
        linkedinPost:"https://www.linkedin.com/",
        flipkart: "https://www.flipkart.com",
        amazon:"https://www.amazon.in/",
        flipkart_googleSearch: "https://www.google.com",
        amazon_googleSearch: "https://www.google.com",
        aibh:"https://www.aibh.in/",
        bookswagon:"https://www.bookswagon.com/",
        meesho:"https://www.meesho.com/",
        snapdeal:"https://www.snapdeal.com/",
        sapnaOnline:"https://www.sapnaonline.com/",
        paytm:"https://paytmmall.com/",
    };
     
     
    // Maximum items to consume at once
    // let customItem = {
    //    // messageId: "messageId_1",
    //     keyword: {
    //         url: "https://www.flipkart.com",
    //         scanId: "66ff1b1594fb09badc288a5d",
    //         assetId: "ffbc3138-379b-385b-a25c-d4729a177be1",
    //         keywordId: "ee0de540-0aa7-3cb1-b324-7331dd00943c",
    //         keyword: "oswaal books",
    //         type: "book",
    //         assetType: "book",
    //         platform: "amazon",
    //     },
    // };

    // // Run the scan with the custom input
    // logger.info(`Using custom item ${JSON.stringify(customItem)}`);
    // await cluster.execute({
    //     url: customItem.keyword.url,
    //     keyword: customItem.keyword,
    // });
    // Maximum items to consume at once (actual code)
    while (true) {
        let item = await queue.consume();
        logger.info(`Got item ${JSON.stringify(item)}`);
        await cluster.execute({
            url: platformDomainMap[item.platform],
            keyword: item,
        });
    }

    //sample input 

    // await cluster.queue({
    //     messageId: "messageId_1",
    //     keyword: {
    //         url: "https://www.google.com",
    //         scanId: "66ff1b1594fb09badc288a5d",
    //         assetId: "ffbc3138-379b-385b-a25c-d4729a177be1",
    //         keywordId: "ee0de540-0aa7-3cb1-b324-7331dd00943c",
    //         keyword: "applied machine learning McGraw Hill Education (India) Private Limited. pdf",
    //         type: "book_social",
    //         assetType: "book",
    //         platform: "googleSearch",
    //     },
    // });

    await cluster.idle();
    await cluster.close();
}

await scan();
