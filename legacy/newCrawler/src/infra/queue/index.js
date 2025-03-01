import Redis from "ioredis";
import logger from "../logging/index.js";

import Joi from "joi";
import dotenv from "dotenv";

/**
 *
 * Class for managing queues.
 * @typedef {Object} RedisQueue
 * @property {Function} produce
 * @property {Function} consume
 *
 * */
class RedisQueue {
    constructor() {
        const envCreds = () => {
            process.env = {
                ...process.env,
            };
            dotenv.config();

            const envSchema = Joi.object({
                redis_url: Joi.string().required(),
                stream_name: Joi.string().required(),
            });
            let { redis_url, stream_name } = process.env;
            let rawCreds = {
                redis_url,
                stream_name,
            };
            const { error, value: verifiedCreds } = envSchema.validate(rawCreds);
            if (error) {
                throw new Error(`Invalid Redis URI in the env, ${error.message}`);
            }
            return verifiedCreds;
        };
        let creds = envCreds();
        this.redis = new Redis(creds.redis_url);
        this.streamName = creds.stream_name;
    }

    async deinit() {
        this.redis.disconnect();
    }

    async produce(data) {
        await this.redis.lpush(this.streamName, JSON.stringify(data));
    }

    async consume() {
        let item = await this.redis.brpop(this.streamName, 0);
        try {
            item = JSON.parse(item[1]);
        } catch(error) {
            logger.error(`Could not parse queue item ${error}`);
            return null;
        }
        return item;
    }


}

export default RedisQueue;
