import mysql from "mysql2/promise";
import Joi from "joi";
import dotenv from "dotenv";
import logger from "../logging/index.js";

class DbUtils {
    constructor() {
        this.connectionPool = null;
    }

    createError(message) {
        let error = new Error(message);
        // error.message = message;
        return error;
    }

    envCreds() {
        // For debugging
        process.env = {
            ...process.env,
        };
        // Loading environment variables from .env file
        dotenv.config();

        // Define the schema for environment variables
        const envSchema = Joi.object({
            host: Joi.string().required(),
            port: Joi.number().port().required(),
            username: Joi.string().required(),
            password: Joi.string().required(),
            database: Joi.string().required(),
        });

        // Extract the database credentials
        let { host, port, username, password, database } = process.env;
        let rawCreds = {
            host,
            port,
            username,
            password,
            database,
        };
        const { error, value: verifiedCreds } = envSchema.validate(JSON.parse(JSON.stringify(rawCreds)));
        if (error) {
            throw this.createError(`Invalid db creds in the env, ${error.message}`);
        }
        return verifiedCreds;
    }

    async init(creds) {
        if (!!this.connectionPool === true) {
            return;
        }

        if (!creds) {
            logger.info("Database credentials not passed, loading from env.");
            creds = this.envCreds();
        }
        if (!creds) {
            throw this.createError("Could not resolve database credentials.");
        }
        const { host, port, username, password, database } = creds;
        this.connectionPool = mysql.createPool(`mysql://${username}:${password}@${host}:${port}/${database}`);
        return this;
    }

    async deinit() {
        await this.connectionPool.end();
        this.connectionPool = null;
    }

    async getConnection() {
        return await this.connectionPool.getConnection();
    }

    async destroyConnection(connection) {
        await connection.release();
    }
}

export default await new DbUtils().init();
