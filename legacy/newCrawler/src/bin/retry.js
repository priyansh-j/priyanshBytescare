import RedisQueue from "../infra/queue/index.js";
import ScansRepo from "../infra/repo/scan.js";

import mongoDb from "../infra/db/mongo/index.js";
import logger from "../infra/logging/index.js";

import RetryKeywords from "../domain/usecases/retryKeywords/index.js";

import cron from "node-cron";

async function main() {
    logger.info("Initializing keyword publisher.");
    let rq = new RedisQueue();
    let retryKeywords = new RetryKeywords(new ScansRepo(), rq);
    // await retryKeywords.exec();

    // 0 0 * * * *
    cron.schedule("0 0 * * * *", async () => {
        logger.info(`CRON: Running cron for retrying keywords.`);
        await retryKeywords.exec();
    });

    // await db.deinit();
    // await mongoDb.deinit();
    // await rq.deinit();
}

await main();
