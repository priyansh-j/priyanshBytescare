import db from "../db/index.js";

/**
 * Class for managing keywords.
 * @typedef {Object} KeywordsRepo
 * @property {Function} getKeywords
 */
class KeywordsRepo {
    constructor() {}

    /**
     * @param {[]String} assetIds
     * @returns {Object}
     * */
    async getKeywords(assetIds) {
        if (assetIds.length === 0) return {};
        let query = `
       SELECT 
            infinity.text_search.*,
            infinity.map.rid as aid
        FROM
            infinity.text_search
                JOIN
            infinity.map ON infinity.text_search.pid = infinity.map.pid
        WHERE
            infinity.map.ptable = 'asset_text_search'
                AND infinity.map.rid IN (?) 
        `;
        let [rows, _] = await db.connectionPool.query(query, [assetIds]);
        return rows.reduce((acc, row) => {
            if (!acc[row.aid]) {
                acc[row.aid] = [];
                acc[row.aid].push({
                    id: row.pid,
                    keyword: row.text,
                    type: row.type,
                });
            }
            acc[row.aid].push({
                id: row.pid,
                keyword: row.text,
                type: row.type,
            });
            return acc;
        }, {});
    }
}

export default KeywordsRepo;
