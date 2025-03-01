import db from "../../infra/db/index.js";
import logger from "../logging/index.js";

function getDomainAndSubdomain(url) {
    try {
        // Create a new URL object
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        // Split the hostname into parts
        const parts = hostname.split(".");

        // If there are only two parts, it's just a domain (e.g., example.com)
        if (parts.length === 2) {
            return {
                domain: hostname,
                subdomain: null,
            };
        } else {
            // The last two parts are the domain, the rest is the subdomain
            const domain = parts.slice(-2).join(".");
            const subdomain = parts.slice(0, -2).join(".");
            return {
                domain: domain,
                subDomain: subdomain || null,
            };
        }
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}

/**
 * Source mappings
 * */

class SourceMappings {
    /**
     * @param source
     * @returns source database object.
     * {
     *   "source":"https://www.pw.live/exams/wp-content/uploads/2023/10/Accounting-and-Financial-Management-for-Bankers.pdf",
     *   "title":"Accounting-and-Financial-Management-for-Bankers.pdf",
     *   "description":"PW LivePW LivePDF19 Oct 2023  38 pages",
     *   "pid":"673b1919-41dc-3adf-9f3b-8d9810439380",
     *   "score":0.7524251456442217,
     *   "prediction":0,
     *   "rejected_by":5
     *  }
     * */
    static mapToDb(source) {
        let parsedUrl = getDomainAndSubdomain(source.source);
        return {
            eid: source.pid,
            title: source.title,
            source: source.source,
            score: source.score,
            prediction: source.prediction,
            rejected_by: source.rejected_by,
            blocked: source.blocked,
            sub_domain: parsedUrl?.subDomain,
            domain: parsedUrl?.domain,
            type: source.type,
            aid: source.assetId,
            rid: source.keywordId,
            entry_type: "auto",
            info: JSON.stringify({ description: source.description, scanId: source.scanId, platform: source.platform }),
        };
    }
}

/**
 * Class for managing sources.
 * @typedef {Object} SourcesRepo
 * @property {Function} getLatestSourceForAsset
 */
class SourcesRepo {
    constructor() {}

    /**
     * @returns {Object}
     * {
     *      aid: maxInsertedAt
     * }
     *
     * */
    async getLatestInsertedAtForSources(assetIds) {
        let query = `select
                            aid,
                            MAX(inserted_at) as max_inserted_at
                    from infinity.new_source
                    where aid in (?)
                    group by aid`;
        let [rows, _] = await db.connectionPool.query(query, [assetIds]);
        return rows.reduce((acc, row) => {
            acc[row.aid] = row.max_inserted_at;
            return acc;
        }, {});
    }

    async save(sources) {
        if (sources.length === 0) {
            return;
        }
        let query = `insert ignore into infinity.new_source (
            eid,
            title, 
            source,
            score,
            prediction, 
            rejected_by,
            blocked,
            sub_domain,
            domain,
            type,
            aid,
            rid, 
            entry_type,
            info) values ?`;
        let queryData = sources.map((sourceRaw) => {
            let source = SourceMappings.mapToDb(sourceRaw);
            return [
                source.eid,
                source.title,
                source.source,
                source.score,
                source.prediction,
                source.rejected_by,
                source.blocked,
                source.sub_domain,
                source.domain,
                source.type,
                source.aid,
                source.rid,
                source.entry_type,
                source.info,
            ];
        });
        const [results] = await db.connectionPool.query(query, [queryData]);
        logger.info(results.info);
    }
}

export default SourcesRepo;
