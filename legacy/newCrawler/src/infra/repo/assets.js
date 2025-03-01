import db from "../../infra/db/index.js";

/**
 * Represents an item in the database.
 *
 * @typedef {Object} asset
 * @property {string} pid - The unique identifier for the item. (Primary Key)
 * @property {string} text - The main content or description of the item.
 * @property {Date} inserted_at - The timestamp when the item was created.
 * @property {Date} [updated_at] - The timestamp when the item was last updated.
 * @property {string} type - The type or category of the item.
 * @property {string} [advanced] - Additional detailed information in medium text format.
 * @property {Date} [expiry] - The expiration date of the item.
 * @property {number} [cycle] - In hours
 * @property {String} client_ids - contatinated client ids.
 *
 * @typedef {Object} assetDomain
 * @property {string} pid
 * @property {string} text
 * @property {Date} insertedAt
 * @property {string} type
 * @property {Date} [expiry]
 * @property {number} [cycle] - In Hours
 * @property {String[]} - clientIds - client ids
 *
 * */
class AssetMappings {
    /**
     * @param {asset} asset
     * @returns {assetDomain}
     * */
    static map(asset) {
        return {
            pid: asset.pid,
            text: asset.text,
            insertedAt: asset.inserted_at,
            type: asset.type,
            expiry: asset.expiry,
            cycle: asset.cycle,
            clientIds: asset.client_ids ? asset.client_ids.split(",") : null,
            advanced: asset.advanced ? JSON.parse(asset.advanced) : null,
        };
    }
}

/**
 * Class for managing assets.
 * @typedef {Object} AssetRepo
 * @property {Function} getNonExpiredAssets
 * @property {Function} getAssetById
 */
class AssetsRepo {
    constructor() {}

    /**
     * @returns {assetDomain}
     * */
    async getNonExpiredAssets() {
        let query = `
        select
            infinity.asset.*,
            group_concat(interface.map.rid separator ',') as client_ids
        from infinity.asset join interface.map on infinity.asset.pid = interface.map.pid
        where expiry > current_date() and interface.map.ptable = "asset"
        group by pid;
        `;
        let [rows, _] = await db.connectionPool.query(query);
        return rows.map((row) => AssetMappings.map(row));
    }

    /**
     * @param {String} id
     * @returns {assetDomain}
     * */
    async getAssetById(id) {
        let query = `select * from infinity.asset where pid = ?`;
        let [rows, _] = await db.connectionPool.query(query, [id]);
        rows = rows.map((row) => AssetMappings.map(row));
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    }
}

export default AssetsRepo;
