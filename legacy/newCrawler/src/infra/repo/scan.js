import mongoose from "mongoose";

const event = new mongoose.Schema({
    status: {
        type: String,
        enum: ["saved", "queued", "processing", "error", "done", "retrying"],
        required: true,
    },
    message: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const platform = new mongoose.Schema({
    platform: String,
    status: {
        type: String,
        enum: ["saved", "queued", "processing", "error", "done", "retrying"],
        required: true,
    },
    events: [event],
});

const keyword = new mongoose.Schema({
    id: String,
    keyword: String,
    type: String,
    platforms: [platform],
});

const scanSchema = new mongoose.Schema({
    scanId: String,
    assetId: String,
    assetType: String,
    clientIds: [String],
    keywords: [keyword],
    updatedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ScanSchema = mongoose.model("scans", scanSchema);

/**
 *
 * Class for managing scans.
 * @typedef {Object} ScansRepo
 * @property {Function} createScans
 * @property {Function} fetchLatestScansForAssets
 * @property {Function} fetchAllFailedScans
 * @property {Function} updateScanRetryForKeyword
 * @property {Function} updateScanDoneForKeyword
 * @property {Function} updateScanErrorForKeyword
 *
 * */
class ScansRepo {
    constructor() {}

    /**
     * @returns {scans}
     * */
    async createScans(assetWiseKeywords) {
        let docs = assetWiseKeywords.map((asset) => {
            let keywords = asset.keywords.map((keyword) => {
                return {
                    keyword: keyword.keyword,
                    type: keyword.type,
                    id: keyword.id,
                    platforms: keyword.platforms.map((platform) => {
                        return {
                            platform,
                            status: "saved",
                            events: [
                                {
                                    status: "saved",
                                },
                            ],
                        };
                    }),
                };
            });

            return {
                assetId: asset.pid,
                assetType: asset.type,
                clientIds: asset.clientIds,
                keywords,
            };
        });
        return await ScanSchema.insertMany(docs);
    }

    async fetchLatestScansForAssets(assetIds) {
        if (assetIds.length === 0) return {};
        let query = [
            {
                $match: {
                    assetId: { $in: assetIds },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$assetId",
                    latestDocument: { $first: "$$ROOT" }, // Keep the latest document in each group
                },
            },
            {
                $project: {
                    _id: 0, // Hide the grouped `_id` field (email in this case)
                    assetId: "$_id", // Show email explicitly
                    latestDocument: 1, // Show the latest document in the group
                },
            },
        ];
        let rows = await ScanSchema.aggregate(query);
        return rows.reduce((acc, row) => {
            acc[row.assetId] = row.latestDocument.createdAt;
            return acc;
        }, {});
    }

    async fetchAllFailedScans() {
        return await ScanSchema.aggregate([
            {
                $unwind: {
                    path: "$keywords",
                    includeArrayIndex: "string",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$keywords.platforms",
                    includeArrayIndex: "string",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    $or: [
                        { "keywords.platforms.status": "error" },
                        { "keywords.platforms.status": "saved" },
                        { "keywords.platforms.status": "retrying" },
                    ],
                },
            },
        ]);
    }

    async updateScanDoneForKeyword(scanId, keywordId, platform) {
        try {
            await ScanSchema.findOneAndUpdate(
                { _id: scanId },
                {
                    $set: { "keywords.$[filterKeywords].platforms.$[platformFilter].status": "done" },
                    $push: {
                        "keywords.$[filterKeywords].platforms.$[platformFilter].events": {
                            status: "done",
                            message,
                        },
                    },
                },
                {
                    arrayFilters: [{ "filterKeywords.id": keywordId }, { "platformFilter.platform": platform }],
                }
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateScanErrorForKeyword(scanId, keywordId, platform, message) {
        try {
            await ScanSchema.findOneAndUpdate(
                { _id: scanId },
                {
                    $set: { "keywords.$[filterKeywords].platforms.$[platformFilter].status": "error" },
                    $push: {
                        "keywords.$[filterKeywords].platforms.$[platformFilter].events": {
                            status: "error",
                            message,
                        },
                    },
                },
                {
                    arrayFilters: [{ "filterKeywords.id": keywordId }, { "platformFilter.platform": platform }],
                }
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateScanRetryForKeyword(scanId, keywordId, platform, message) {
        try {
            await ScanSchema.findOneAndUpdate(
                { _id: scanId },
                {
                    $set: { "keywords.$[filterKeywords].platforms.$[platformFilter].status": "retrying" },
                    $push: {
                        "keywords.$[filterKeywords].platforms.$[platformFilter].events": {
                            status: "retrying",
                            message,
                        },
                    },
                },
                {
                    arrayFilters: [{ "filterKeywords.id": keywordId }, { "platformFilter.platform": platform }],
                }
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default ScansRepo;
