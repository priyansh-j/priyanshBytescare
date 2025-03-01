function createConnection(env, decrypted) {
  const mysql = require("serverless-mysql")({
    config: {
      host: process.env[`database_host_${env}`],
      database: process.env.database,
      user: process.env[`database_username_${env}`],
      password: decrypted,
    },
  });
  return mysql;
}

async function getPids(mysql, query) {
  return await mysql.query(query);
}

function addToAssetData(pids, assetData, engine, scan_label) {
  pids.forEach((pid) => {
    assetData.push({
      queryStringParameters: {
        engine: engine,
        aid: pid.text,
        scan_label: scan_label
      },
    });
  });
}

async function fetch(
  invocation_time,
  env,
  decrypted,
  callback
) {
  const mysql = await createConnection(env, decrypted);

  invocation_time = invocation_time || new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(invocation_time);

  const intervals = [24, 48, 168]; // hours for each time interval
  
  // The following dictionary will be replaced in the future with an automated process to directly get the required userIds from the DB instead of hardcoding values.
  const interval_userId = {
    24: {"userIds":["958e2d30-3ffe-11ee-a3c6-b90885ccc144"], "label":"2"},
    48: {"userIds":["cea7d2b0-ed8d-11ed-a3f0-fd828012cb3b", "d37b6010-f56a-11ed-bf17-b109756ecfb1", "a8c08080-f56a-11ed-bf17-b109756ecfb1", "6e0f5330-f56a-11ed-bf17-b109756ecfb1"], "label":"2"},
    168: {"userIds":["cea7d2b0-ed8d-11ed-a3f0-fd828012cb3b", "d37b6010-f56a-11ed-bf17-b109756ecfb1", "a8c08080-f56a-11ed-bf17-b109756ecfb1", "6e0f5330-f56a-11ed-bf17-b109756ecfb1"], "label":"3"},
  };
  const periods = intervals.map((interval) => {
    return [
      `DATE_SUB('${invocation_time}', INTERVAL ${interval + 3} HOUR)`,
      `DATE_SUB('${invocation_time}', INTERVAL ${interval} HOUR)`,
      interval_userId[interval]["userIds"],
      interval_userId[interval]["label"],
    ];
  });

  let assetData = [];

  // Used to extract the assests inserted 3 to 6 hrs ago, for the first scan
  let pids = await getPids(
    mysql,
    `SELECT DISTINCT 
                        text_search.pid as tid,
                        asset.pid as aid,
                        infinity.text_search.text as text,
                        infinity.map.pid as infrid,
                        asset.inserted_at
                    FROM 
                        asset
                    INNER JOIN 
                        infinity.map ON asset.pid = infinity.map.rid
                    INNER JOIN 
                        infinity.text_search ON text_search.pid = infinity.map.pid
                    WHERE
                        asset.inserted_at BETWEEN DATE_SUB('${invocation_time}', INTERVAL 6 HOUR) AND DATE_SUB('${invocation_time}', INTERVAL 3 HOUR)`
  );

  addToAssetData(pids, assetData, "google", "1");

  // Used to get the assets for subsequent scans, based on the corresponding timeline.
  for (const [start, end, rids, label] of periods) {
    let pids = await getPids(
      mysql,
      `SELECT DISTINCT 
                        text_search.pid as tid,
                        asset.pid as aid,
                        interface.map.ptable as ptable,
                        interface.map.rid as cid,
                        infinity.text_search.text as text,
                        infinity.map.pid as infrid,
                        asset.inserted_at
                    FROM 
                        asset
                    INNER JOIN 
                        interface.map ON asset.pid = interface.map.pid
                    INNER JOIN 
                        infinity.map ON asset.pid = infinity.map.rid
                    INNER JOIN 
                        infinity.text_search ON text_search.pid = infinity.map.pid
                    WHERE 
                        interface.map.rid IN ('${rids.join("', '")}')
                        AND interface.map.ptable LIKE 'asset%'
                        AND asset.inserted_at BETWEEN ${start} AND ${end}`
    );

    addToAssetData(pids, assetData, "google", label);
  }

  console.log(assetData.length);

  await mysql.end();
  mysql.quit();
  // Return the results
  return callback(null, assetData);
}

module.exports = {
  fetch: fetch,
};
