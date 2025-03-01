import RedisQueue from "../infra/queue/index.js";
import AddKeywords from "../domain/usecases/addKeywordsToQueue/index.js";

import AssetsRepo from "../infra/repo/assets.js";
import SourcesRepo from "../infra/repo/sources.js";
import KeywordsRepo from "../infra/repo/keywords.js";
import ScansRepo from "../infra/repo/scan.js";

import db from "../infra/db/index.js";
import mongoDb from "../infra/db/mongo/index.js";
import logger from "../infra/logging/index.js";

import cron from "node-cron";

async function main() {
    logger.info("Initializing keyword publisher.");
    let rq = new RedisQueue();
    let addKeywords = new AddKeywords(new AssetsRepo(), new SourcesRepo(), new KeywordsRepo(), new ScansRepo(), rq);
    // await addKeywords.exec(true);
    // 0 0 * * * * 
    cron.schedule("0 * * * * *", async () => {
        logger.info(`CRON: Running cron for adding keywords to the queue.`);
        await addKeywords.exec(true);
    });

    // await db.deinit();
    // await mongoDb.deinit();
    // await rq.deinit();
}

await main();
