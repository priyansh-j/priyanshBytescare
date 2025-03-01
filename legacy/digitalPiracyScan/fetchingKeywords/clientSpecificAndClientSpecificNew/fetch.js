let keyword = "";
const async = require("async");
const http = require("https");
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}

async function fetch(rid, date_init, date_final, crawler_list, env, decrypted, callback) {
    if (env == "dev") {
        const mysql = require("serverless-mysql")({
            config: {
                host: process.env.db_host_dev,
                database: process.env.database,
                user: process.env.database_username_dev,
                password: decrypted,
            },
        });
        let date;
        date = new Date();
        date =
            date.getUTCFullYear() +
            "-" +
            ("00" + (date.getUTCMonth() + 1)).slice(-2) +
            "-" +
            ("00" + date.getUTCDate()).slice(-2) +
            " " +
            ("00" + date.getUTCHours()).slice(-2) +
            ":" +
            ("00" + date.getUTCMinutes()).slice(-2) +
            ":" +
            ("00" + date.getUTCSeconds()).slice(-2);

        //let results = await mysql.query("select * from map where inserted_at >= ? and inserted_at <= ? and ptable not like 'asset_%' ;",[ date_init , date_final]);
        let pids = await mysql.query(
            `SELECT DISTINCT 
            text_search.pid as tid , asset.pid as aid,  interface.map.ptable as ptable, interface.map.rid as cid , infinity.text_search.text as text , infinity.map.pid as infrid 
            FROM asset 
            INNER JOIN interface.map ON asset.pid = map.pid  
            INNER JOIN infinity.map  ON asset.pid = infinity.map.rid 
            INNER JOIN infinity.text_search ON text_search.pid = infinity.map.pid 
            where interface.map.rid = ? and interface.map.ptable like 'asset' `,
            [rid]
        );
        console.log(pids);
        //process.exit()
        date = convertTZ(date);
        //await mysql.end()
        //return callback(null,pids)
        var numRows = pids.length;
        let assetData = [];
        console.log(numRows);

        try {
            let num;
            let numrows = pids.length;
            for (num = 0; num < numRows; num++) {
                var key = pids[num].text;
                var aid = pids[num].aid;
                var tid = pids[num].tid;
                let obj = {};
                obj.aid = aid;
                obj.key = key;
                obj.tid = tid;
                obj.crawler_list = crawler_list;
                obj.env = env;
                assetData.push(obj);
            }
        } catch (err) {
            console.log(err);
        }

        await mysql.end();
        mysql.quit();
        // Return the results
        return callback(null, assetData);
    } else if (env == "prod") {
        const mysql = require("serverless-mysql")({
            config: {
                host: process.env.db_host_prod,
                database: process.env.database,
                user: process.env.database_username_prod,
                password: decrypted,
            },
        });
        let date;
        date = new Date();
        date =
            date.getUTCFullYear() +
            "-" +
            ("00" + (date.getUTCMonth() + 1)).slice(-2) +
            "-" +
            ("00" + date.getUTCDate()).slice(-2) +
            " " +
            ("00" + date.getUTCHours()).slice(-2) +
            ":" +
            ("00" + date.getUTCMinutes()).slice(-2) +
            ":" +
            ("00" + date.getUTCSeconds()).slice(-2);

        //let results = await mysql.query("select * from map where inserted_at >= ? and inserted_at <= ? and ptable not like 'asset_%' ;",[ date_init , date_final]);
        let pids = await mysql.query(
            "SELECT DISTINCT text_search.pid as tid , asset.pid as aid,  interface.map.ptable as ptable, interface.map.rid as cid , infinity.text_search.text as text , infinity.map.pid as infrid FROM asset INNER JOIN interface.map ON asset.pid = map.pid  INNER JOIN infinity.map  ON asset.pid = infinity.map.rid INNER JOIN infinity.text_search ON text_search.pid = infinity.map.pid where interface.map.rid = ? and interface.map.ptable like 'asset' ",
            [rid]
        );
        console.log(pids);
        //process.exit()
        date = convertTZ(date);
        //await mysql.end()
        //return callback(null,pids)
        var numRows = pids.length;
        let assetData = [];
        console.log(numRows);

        try {
            let num;
            let numrows = pids.length;
            for (num = 0; num < numRows; num++) {
                var key = pids[num].text;
                var aid = pids[num].aid;
                var tid = pids[num].tid;
                let obj = {};
                obj.aid = aid;
                obj.key = key;
                obj.tid = tid;
                obj.crawler_list = crawler_list;
                obj.env = env;
                assetData.push(obj);
            }
        } catch (err) {
            console.log(err);
        }

        await mysql.end();
        mysql.quit();
        return callback(null, assetData);
    }
}

module.exports = {
    fetch: fetch,
};
