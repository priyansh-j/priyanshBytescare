import logger from "../../../infra/logging/index.js";
import filterUtils from "../filterUrls/index.js";

import { v3 as uuidv3 } from "uuid";

let CONSUMER_GROUP_NAME = process.env.stream_consumer_group_name;

/**
 * Save the scraped results and ack the message in the queue
 * @typedef {import("../../../infra/repo/assets.js").AssetRepo} AssetRepo
 * @typedef {import("../../../infra/repo/sources.js").SourcesRepo} SourcesRepo
 * @typedef {import("../../../infra/queue/index.js").RedisQueue} Queue
 * @typedef {import("../../../infra/repo/scan.js").ScansRepo} ScansRepo
 */
class SaveResults {
    /**
     * @param {AssetRepo} assetRepo
     * @param {SourcesRepo} sourcesRepo
     * @param {ScansRepo} scansRepo
     * */
    constructor(assetRepo, sourcesRepo, scansRepo) {
        if (!!assetRepo === false || !!sourcesRepo === false || !!scansRepo === false) {
            throw new Error("Repo not injected.");
        }
        this.assetRepo = assetRepo;
        this.sourcesRepo = sourcesRepo;
        this.scansRepo = scansRepo;

    }

    getSourceType(platform) {
        if (["googleSearch", "bing", "duckduckgo", "yandex"].filter((el) => el === platform).length > 0) {
            return "search";
        } else if(['twitterTweet', 'twitterProfile','linkedinPost','instagramPost','facebookPost'].includes(platform)) {
        } else if(['flipkart','amazon','amazon_googleSearch','flipkart_googleSearch','meesho','bookswagon','sapnaOnline','snapdeal','aibh','paytm'].includes(platform)) {
            return "ecom_search";
        }
    }

    async exec({  scanId, assetId, keywordId, platform, results }) {      //messageId,

        } else if(['twitterTweet', 'twitterProfile'].includes(platform)) {
            return "social_search";
        }
    }

    async exec({ scanId, assetId, keywordId, platform, results }) {
        let sources = [...results];


        let asset = await this.assetRepo.getAssetById(assetId);
        if (!!asset === false) {
            logger.error(`Asset not found. ${JSON.stringify({ scanId, assetId, keywordId, platform })}`);
            return null;
        }

        sources = sources
            .filter((el) => el != null && el != undefined && el.source != null && el.source != undefined)
            .map((el) => {
                el.pid = uuidv3(el.source + "#search-" + asset.type + "-" + asset.pid, uuidv3.URL);
                el.title = el.title.replace(/[\u0800-\uFFFF]/g, "");
                el.description = el.description ? el.description.replace(/[\u0800-\uFFFF]/g, "") : el.description;
                return el;
            });
        const filters = new filterUtils(asset, 1, asset.type);
        let filteredSources = await filters.filter_all(sources);
        logger.info(`Filtered results -> ${filteredSources.length} og list -> ${sources.length}`);
        logger.info(`Filtered results -> ${JSON.stringify(filteredSources[0])} og list -> ${JSON.stringify(sources[0])}`);
      
        // Save the results
        filteredSources = filteredSources.map((source) => {
            return {
                ...source,
                type: this.getSourceType(platform),
                assetId,
                keywordId,
                scanId,
                platform,
            };
        });
        logger.info(`Saving ${sources.length} sources for ${JSON.stringify({ scanId, assetId, keywordId, platform })}`);
        // Save sources

        await this.sourcesRepo.save(filteredSources);

        // Update the scan status
        await this.scansRepo.updateScanDoneForKeyword(scanId, keywordId, platform);
        console.log("scan info updated");
    }
}

export default SaveResults;
