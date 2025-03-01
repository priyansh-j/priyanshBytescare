import logger from "../../../infra/logging/index.js";

/**
 * @typedef {import("../../../infra/repo/assets.js").AssetRepo} AssetRepo
 * @typedef {import("../../../infra/repo/sources.js").SourcesRepo} SourcesRepo
 * @typedef {import("../../../infra/repo/keywords.js").KeywordsRepo} KeywordsRepo
 * @typedef {import("../../../infra/repo/scan.js").ScansRepo} ScansRepo
 * @typedef {import("../../../infra/queue/index.js").RedisQueue} Queue
 */
class FetchKeywords {
    /**
     * @param {AssetRepo} assetRepo
     * @param {SourcesRepo} sourcesRepo
     * @param {KeywordsRepo} keywordsRepo
     * @param {ScansRepo} scansRepo
     * @param {Queue} queue
     * */
    constructor(assetRepo, sourcesRepo, keywordsRepo, scansRepo, queue) {
        if (!!assetRepo === false || !!sourcesRepo === false || !!keywordsRepo === false || !!scansRepo === false) {
            throw new Error("Repo not injected.");
        }
        this.assetRepo = assetRepo;
        this.sourcesRepo = sourcesRepo;
        this.keywordsRepo = keywordsRepo;
        this.scansRepo = scansRepo;
        if (!!queue === false) {
            throw new Error("Queue not injected");
        }
        this.queue = queue;
    }

    /**
     *
     * The platforms on which the keywords will be crawled will be determined using
     * assetType and keywordType
     *
     * Possible Asset types
     * 'web_presence'
     * 'book'
     * 'youtube'
     * 'movie'
     * 'brand_trademark'
     * 'highlights'
     * 'music'
     * 'brand_content'
     * 'creator'
     * 'tv'
     * 'app'
     * 'text'
     * 'live_stream'
     * 'brand'
     *
     * Possible Keyword types
     * 'web_presence'
     * 'book_plain'
     * 'youtube'
     * 'book_social'
     * 'youtube_index'
     * 'book'
     * 'brand_content_social'
     * 'movie'
     * 'live_stream_plain'
     * 'torrent_index'
     * 'book_index'
     * 'brand_content'
     * 'torrent'
     * 'live_stream_social'
     * 'music_social'
     * 'live_stream'
     * 'movie_social'
     * 'music'
     * 'movie_index'
     * 'live_social'
     * 'highlights_index'
     * 'highlights_social'
     * 'app'
     * 'movie_plain'
     * 'highlights_plain'
     * 'music_index'
     * 'app_social'
     * 'live_stream_index'
     * 'highlights'
     * 'tv_social'
     * 'app_index'
     * 'tv'
     * 'app_plain'
     * 'music_plain'
     * 'web_presence_social'
     * 'brand_trademark_social'
     * 'web_presence_plain'
     * 'web_presence_index'
     * 'music_yt'
     * 'tv_plain'
     * 'trademark_plain'
     * 'brand_content_plain'
     * 'b_social'
     * 'default'
     * 'brand_trademark'
     * 'tv_index'
     *
     * */
    getPlatforms(assetType, keywordType) {
        //let searchEngines = ["flipkart"];
         let searchEngines = ["googleSearch", "bing", "duckduckgo", "yandex"];
        // let socialMediaSearch = [
        //     "googlesearchinstagram",
        //     "googlesearchfacebook",
        //     "googlesearchtwitter",
        //     "facebook",
        //     "instagram",
        //     "twitter",
        //     "linkedin",
        //     "twitterTweet",
        //     "twitterProfile",
        // "linkedinPost",
        // "facebookPost",
        // "instagramPost"
        // ];
        let ecomSearch = ["flipkart","amazon"];         // "meesho","bookswagon","sapnaOnline","snapdeal","aibh","paytm"  ->will add them according to requirement.
        let ecomSearchEngine = ["flipkart_googleSearch","amazon_googleSearch"];

        if (keywordType.split(/book/).length > 1) {
            return ecomSearch;
        }
        if (keywordType.split(/book_social/).length > 1) {
            return ecomSearchEngine;
        }

        // if (keywordType.split(/_index/).length > 1) {
        //     return searchEngines;
        // }
        // if (keywordType.split(/_plain/).length > 1) {
        //     return [...searchEngines, ...socialMediaSearch];
        // }
        // if (keywordType.split(/_social/).length > 1) {
        //     return [...socialMediaSearch];
        // }
        // if (keywordType === "web_presence") {
        //     return [...searchEngines, ...socialMediaSearch];
        // }
        return searchEngines;
    }

    /**
     * Split this usecase into multiple usecases.
     *
     * This function fetchs keywords and the platform they are to be crawled on.
     * 1. Fetch non-expired assets.
     * 2. Fetch last added entries for all of these assets.
     * 3. Check according to these that can we start crawling for these.
     * 4. Return the keywords for the assets with platforms.
     * Note: Platforms will be decided according to the keyword and asset types.
     *
     * @param {boolean} getValid - should we get the valid keywords or all keywords.
     */
    async exec(_getValid) {
        // Fetch non expired assets
        let assets = await this.assetRepo.getNonExpiredAssets();
        let assetsMap = assets.reduce((acc, asset) => {
            acc[asset.pid] = asset;
            return acc;
        }, {});
        logger.info(`[FetchKeywords] Non expired assets found -> ${assets.length}`);

        // Filter assets according to their respective cycles
        let assetsLastScanAt = await this.scansRepo.fetchLatestScansForAssets(assets.map((asset) => asset.pid));
        logger.info(`[FetchKeywords] Last scans for assets found -> ${Object.keys(assetsLastScanAt).length}`);
        let currentDate = new Date();
        let ignoredAssets = 0;
        let filteredAssets = assets.filter((asset) => {
            let lastScanAt = assetsLastScanAt[asset.pid];
            // If lastScanAt is not present then no scan has happened.
            if (!!lastScanAt === false) {
                return true;
            }
            let lastCycleStart = new Date(currentDate);
            lastCycleStart.setHours(-asset.cycle);
            if (lastScanAt <= lastCycleStart) {
                return true;
            } else {
                // logger.info(`Asset already scanned -> cycle:${asset.cycle} lastScanAt:${lastScanAt} lastCycleStart:${lastCycleStart}`);
                // logger.info(`Asset text -> ${asset.text}`);
                ignoredAssets += 1;
            }
        });
        logger.info(`[FetchKeywords] These assets are already crawled -> ${ignoredAssets}`);
        logger.info(`[FetchKeywords] Filtered assets -> ${filteredAssets.length}`);
        if (filteredAssets.length === 0) {
            logger.info(`[FetchKeywords] All of the assets are already scanned.`);
            return;
        }

        // Fetch keywords.
        let assetWiseKeywords = await this.keywordsRepo.getKeywords(filteredAssets.map((asset) => asset.pid));
        logger.info(`[FetchKeywords] Got keywords -> ${Object.keys(assetWiseKeywords).length}`);
        let noOfKeywordsNotFound = 0;
        for (let asset of filteredAssets) {
            if (!!assetWiseKeywords[asset.pid] === true) {
                asset.keywords = assetWiseKeywords[asset.pid];
            } else {
                noOfKeywordsNotFound += 1;
                // logger.info(`No keywords found for aid ${asset.pid}`);
                asset.keywords = [
                    {
                        id: "na",
                        keyword: asset.text,
                        type: "web_presence",
                        assetType: assetsMap[asset.pid].type,
                    },
                ];
            }
        }
        logger.info(`[FetchKeywords] No of keywords not found -> ${noOfKeywordsNotFound} assets`);
        logger.info(`[FetchKeywords] Keywords present in -> ${filteredAssets.filter((asset) => asset.keywords?.length > 0).length}`);
        let assetTypes = new Set();
        let keywordTypes = new Set();
        filteredAssets.map((asset) => {
            assetTypes.add(asset.type);
            asset.keywords.map((keyword) => {
                keywordTypes.add(keyword.type);
            });
        });
        // logger.info(`[FetchKeywords] Unique asset types found -> ${JSON.stringify(assetTypes)} and Unique keywords -> ${JSON.stringify(keywordTypes)}`);

        // Map keywords add platforms.
        filteredAssets = filteredAssets.map((asset) => {
            asset.keywords.map((keyword) => {
                keyword.platforms = this.getPlatforms(asset.type, keyword.type);
                return keyword;
            });
            return asset;
        });

        // Create new scans.
        let scans = await this.scansRepo.createScans(filteredAssets);
        let queueItems = [];
        for (let scan of scans) {
            for (let keyword of scan.keywords) {
                for (let platform of keyword.platforms) {
                    queueItems.push({
                        scanId: scan._id.toString(),
                        assetId: scan.assetId,
                        keywordId: keyword.id,
                        keyword: keyword.keyword,
                        type: keyword.type,
                        assetType: scan.assetType,
                        platform: platform.platform,
                    });
                }
             
            }
        }
        logger.info(`[FetchKeywords] Adding ${queueItems.length} items to the queue.`);
        for (let item of queueItems) {
            this.queue.produce(item);
        }
    }
}

export default FetchKeywords;
