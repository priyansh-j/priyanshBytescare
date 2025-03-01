import logger from "../../../infra/logging/index.js";

/**
 * @typedef {import("../../../infra/repo/scan.js").ScansRepo} ScansRepo
 * @typedef {import("../../infra/queue/index.js").RedisQueue} Queue
 */
class RetryKeywords {
    /**
     * @param {ScansRepo} scansRepo
     * @param {Queue} queue
     * */
    constructor(scansRepo, queue) {
        if (!!scansRepo === false) {
            throw new Error("Repo not injected.");
        }
        this.scansRepo = scansRepo;
        if (!!queue === false) {
            throw new Error("Queue not injected");
        }
        this.queue = queue;
    }

    /**
     * Retry failed crawling
     */
    async exec() {
        logger.info("Retrying failed scannings.");
        let failedScans = await this.scansRepo.fetchAllFailedScans();
        let retryKeywords = [];

        for (let scan of failedScans) {
            let events = scan.keywords.platforms.events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            let latestEvent = events[0];
            let numberOfFailedEvents = events.filter((event) => event.status === "error").length;
            let timeTillLatestEvent = (new Date() - latestEvent.createdAt) / (1000 * 60 * 60);
            let statusCheck = latestEvent.status === "error" || latestEvent.status === "saved" || latestEvent.status === "retrying";
            if (statusCheck && timeTillLatestEvent > 24 && !(numberOfFailedEvents > 10)) {
                retryKeywords.push({
                    scanId: scan._id.toString(),
                    assetId: scan.assetId,
                    keywordId: scan.keywords.id,
                    keyword: scan.keywords.keyword,
                    type: scan.keywords.type,
                    assetType: scan.assetType,
                    platform: scan.keywords.platforms.platform,
                });
            }
        }
        logger.info(`Adding ${retryKeywords.length}`);
        for (let item of retryKeywords) {
            await this.scansRepo.updateScanRetryForKeyword(item.scanId, item.keywordId, item.platform, "Retrying");
        }
        for (let item of retryKeywords) {
            this.queue.produce(item);
        }
    }
}

export default RetryKeywords;
