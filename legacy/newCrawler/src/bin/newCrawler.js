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

// Init datacenter proxy
let USE_PROXY = process.env.USE_PROXY === "true" ? true : false;
let PROXY_HOST = process.env.PROXY_HOST;
let PROXY_USERNAME = process.env.PROXY_USERNAME;
let PROXY_PASSWORD = process.env.PROXY_PASSWORD;
let MAX_DATACENTER_BROWSERS = 4;

let perBrowserOptionsDatacenter = [];
for (let currentBrowserNum = 0; currentBrowserNum < MAX_DATACENTER_BROWSERS; currentBrowserNum++) {
    let args = ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1361,926"];
    if (USE_PROXY) {
        args.push(`--proxy-server=${PROXY_HOST}:9000`);
    }
    perBrowserOptionsDatacenter.push({
        headless: true,
        args,
    });
}

let dataCenterCluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_BROWSER,
    sameDomainDelay: 4000,
    monitor: false,
    retryLimit: 3,
    maxConcurrency: perBrowserOptionsDatacenter.length,
    perBrowserOptions: perBrowserOptionsDatacenter,
});

logger.info("Data center cluster started");

let RES_PROXY_HOST = process.env.RES_PROXY_HOST;
let RES_PROXY_PORT = process.env.RES_PROXY_PORT;
let RES_PROXY_PORT_MAX = process.env.RES_PROXY_PORT_MAX;
let RES_PROXY_USERNAME = process.env.RES_PROXY_USERNAME;
let RES_PROXY_PASSWORD = process.env.RES_PROXY_PASSWORD;

let perBrowserOptions = [];
let currentPort = parseInt(RES_PROXY_PORT);
let maxPort = parseInt(RES_PROXY_PORT_MAX);
while (currentPort <= maxPort) {
    let args = ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1361,926"];
    if (USE_PROXY) {
        args.push(`--proxy-server=${RES_PROXY_HOST}:${currentPort}`);
    }
    perBrowserOptions.push({
        headless: true,
        args,
    });
    currentPort += 1;
}

let residentialCluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_BROWSER,
    sameDomainDelay: 4000,
    monitor: false,
    maxConcurrency: perBrowserOptions.length,
    retryLimit: 3,
    perBrowserOptions,
});

logger.info("Residential cluster started");

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
    let results = await scrape(page, keyword, platform);
    if (!!results === false || results.length === 0) {
        logger.info(`[GOT_NO_RESULTS] for scanId -> ${scanId} keywordId -> ${keywordId} platform -> ${platform}`);
        throw new Error("GOT_NO_RESULTS");
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
}

await dataCenterCluster.task(async ({ page, data, worker }) => {
    let keywordId = data.keyword?.keywordId;
    let scanId = data.keyword?.scanId;
    let platform = data.keyword?.platform;
    try {
        if (USE_PROXY) {
            await page.authenticate({
                username: PROXY_USERNAME,
                password: PROXY_PASSWORD,
            });
        }

        logger.info(`[WORKER_${worker.id}]-> processing keyword ${keywordId} for scan ${scanId} and platform ${platform} on datacenter crawler`);
        await scrapePlatform(page, data);
    } catch (error) {
        console.log(error);
        logger.error(`[${platform}::${keywordId}::${scanId}]Error processing ${error.message}`);
        throw error;
    }
});

await residentialCluster.task(async ({ page, data, worker }) => {
    try {
        if (USE_PROXY) {
            await page.authenticate({
                username: RES_PROXY_USERNAME,
                password: RES_PROXY_PASSWORD,
            });
        }

        logger.info(
            `[WORKER_${worker.id}]-> processing keyword ${data.keyword.keywordId} for scan ${data.keyword.scanId} and platform ${data.keyword.platform} on residential crawler`
        );
        await scrapePlatform(page, data);
    } catch (error) {
        console.log(error);
        logger.error(`Error processing ${error.message}`);
        throw error;
    }
});

async function scan() {
    logger.info("Starting scan");

    // This is used to manage wait time for the same domain in puppeteer cluster.
    const platformDomainMap = {
        googleSearch: "https:://www.google.com",
        bing: "https://www.bing.com",
        duckduckgo: "https://duckduckgo.com",
        yandex: "https://yandex.com",
    };

    logger.info("Starting consumption of queue");
    while (true) {
        // let item = `{"url":"https://www.google.com","scanId":"66ff1b1594fb09badc288a5d","assetId":"ffbc3138-379b-385b-a25c-d4729a177be1","keywordId":"ee0de540-0aa7-3cb1-b324-7331dd00943c","keyword":"applied machine learning McGraw Hill Education (India) Private Limited. pdf","type":"book_social","assetType":"book","platform":"googleSearch"}`;
        let item = await queue.consume();
        let url = platformDomainMap[item.platform];
        logger.info(`Processing item \n ${JSON.stringify(item)} \n scanning ${url}`);
        let scanRepo = new ScansRepo();
        try {
            await dataCenterCluster.execute({
                url,
                keyword: item,
            });
        } catch (_error) {
            await scanRepo.updateScanErrorForKeyword(item.scanId, item.keywordId, item.platform, "Datacenter failed.");
            try {
                await residentialCluster.execute({
                    url,
                    keyword: item,
                });
            } catch (_error) {
                await scanRepo.updateScanErrorForKeyword(item.scanId, item.keywordId, item.platform, "Residential failed.");
            }
        }
    }
}

await scan();
