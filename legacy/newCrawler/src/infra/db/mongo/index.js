import mongoose from "mongoose";
import Joi from "joi";
import dotenv from "dotenv";
import logger from "../../logging/index.js";

class MongoDbUtils {
    constructor() {
        this.connection = null;
    }

    createError(message) {
        let error = new Error(message);
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
            mongo_uri: Joi.string().required(), // MongoDB connection URI (can include credentials and database name)
        });

        // Extract MongoDB connection URI
        let { mongo_uri } = process.env;
        let rawCreds = {
           mongo_uri,
        };
        const { error, value: verifiedCreds } = envSchema.validate(rawCreds);
        if (error) {
            throw this.createError(`Invalid MongoDB URI in the env, ${error.message}`);
        }
        return verifiedCreds;
    }

    async init(creds) {
        if (!!this.connection === true) {
            return;
        }
        if (!creds) {
            logger.info("MongoDB credentials not passed, loading from env.");
            creds = this.envCreds();
        }
        if (!creds) {
            throw this.createError("Could not resolve MongoDB credentials.");
        }

        const { mongo_uri } = creds;

        try {
            // Establish the MongoDB connection
            this.connection = await mongoose.connect(mongo_uri);
            logger.info("MongoDB connection established.");
        } catch (error) {
            throw this.createError(`Error connecting to MongoDB: ${error.message}`);
        }

        return this;
    }

    async deinit() {
        if (this.connection) {
            await mongoose.disconnect();
            this.connection = null;
            logger.info("MongoDB connection closed.");
        }
    }
}

export default await new MongoDbUtils().init();
