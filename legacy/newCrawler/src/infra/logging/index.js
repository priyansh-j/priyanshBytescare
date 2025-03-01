import dotenv from "dotenv";
import axios from "axios";
import winston from "winston";
const { format, transports } = winston;

// Custom transport to send logs to a log collector API
class APILogTransport extends winston.Transport {
    constructor() {
        super();
        dotenv.config();
        this.apiUrl = process.env.zo_url; // API endpoint where logs will be sent
        this.username = process.env.zo_user;
        this.password = process.env.zo_password;
    }

    async log(info, callback) {
        const { level, message, ...meta } = info;

        // Create the payload for the log collector
        const logPayload = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };

        // Send the log to the log collector API using axios
        try {
            await axios.post(this.apiUrl, logPayload, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
            });
        } catch (error) {
            console.error("Failed to send log to log collector API:", error.message);
        }

        // Ensure the callback is called to continue logging
        callback();
    }
}

// Define log format
// const logFormat = format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.errors({ stack: true }), format.splat(), format.json());

// Custom format for console output
const consoleFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
        const logMessage = stack || message;
        return `[${timestamp}:${level}] -> ${logMessage}`;
    })
);

// JSON format for file output
const fileFormat = format.combine(format.timestamp(), format.errors({ stack: true }), format.json());

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service: `bytescare-${process.env.service ? process.env.service : "service"}` },
    transports: [
        // Write all logs with importance level of `info` or less to `combined.log`
        // new transports.File({ filename: "combined.log", format: fileFormat }),
        new transports.Console({ format: consoleFormat }),
        new APILogTransport(),
    ],
});

export default logger;
