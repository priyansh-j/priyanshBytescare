var CONFIG = require('./config.json');
const mysql = require('serverless-mysql')({
  config: {
    host     : CONFIG.database.host,
    database : 'infinity',
    user     : CONFIG.database.user,
    password : CONFIG.database.password
  }
});
// const mysql = require('serverless-mysql')({
//   config: {
//     host     : 'bytescare-products.cd5ys33hnzln.ap-south-1.rds.amazonaws.com',
//     database : 'infinity',
//     user     : CONFIG.database.user,
//     password : 'yGWw75PnVrwckX7'
//   }
// });
const url = require('url');
const { v3: uuidv3 } = require("uuid");

async function getDomainAndSubdomain(urlString) {
  const parsedUrl = url.parse(urlString);
  const hostname = parsedUrl.hostname;
  const parts = hostname.split('.').reverse();

  const domain = parts.slice(0, 2).reverse().join('.');
  const subdomain = parts.slice(2).reverse().join('.');

  return { domain, subdomain };
}

async function getLabels(mysql, query) {
  return await mysql.query(query);
}

async function insert(el,asset_id,callback){
    try {
    // const currentDate = getCurrentUTCDate();
    var date;
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' + 
        ('00' + date.getUTCHours()).slice(-2) + ':' + 
        ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
        ('00' + date.getUTCSeconds()).slice(-2);
    let searchArray = [];
    let mapArray = [];
    let labelArray = [];
    let labelMap = {};

    // Fetch labels first
    const labelList = await getLabels(mysql, `SELECT pid, label FROM interface.labels WHERE label IN ("First Scan", "Second Scan", "Third Scan")`);
    labelList.forEach(item => {
      labelMap[item.label] = item.pid;
    });
    
    // console.log(labelMap);
    // console.log(labelMap['First Scan']);
    
    for (let item of el) {
      const { domain, subdomain } = await getDomainAndSubdomain(item.source);

      // Prepare data for 'search' table
      searchArray.push([item.pid, item.title, item.source, item.description, date, date, item.score, item.prediction, item.rejected_by, null, subdomain, domain]);

      // Prepare data for 'map' table
      mapArray.push([item.pid, asset_id, date, "asset_search"]);

      // Prepare data for 'interface.url_label' table
      var label = null;
        if(item.label == '1'){
          if('First Scan' in labelMap){
            label = labelMap['First Scan'];
            console.log(label);
          }
        }
        else if(item.label == '2'){
          if('Second Scan' in labelMap){
            label = labelMap['Second Scan'];
          }
        }
        else if(item.label == '3'){
          if('Third Scan' in labelMap){
            label = labelMap['Third Scan'];
          }
        }
        
        if(label){
          let label_pid = uuidv3(item.pid + asset_id + label, process.env.asset_namespace);
          labelArray.push( [label_pid, item.pid, asset_id, date, domain, label, subdomain]);
        }
    }
    // console.log(labelArray);
    // Insert into 'search' table
    const searchResult = await mysql.query('INSERT IGNORE INTO search VALUES ?', [searchArray]);

    
    // Insert into 'map' table
    if (mapArray.length > 0) {
      await mysql.query('INSERT IGNORE INTO map VALUES ?', [mapArray]);
    }

    // Insert into 'interface.url_label' table
    if (labelArray.length > 0) {
      // console.log('Inserting');
      await mysql.query('INSERT IGNORE INTO interface.url_label (pid, rid, aid, updated_at, domain, label, sub_domain) VALUES ?', [labelArray]);
    }
    // Call callback with results
    callback(searchResult); // Returns the number of rows inserted into 'search'

  } catch (err) {
    console.error(err);
    callback(null);
  } finally {
    await mysql.end();
    mysql.quit();
  }
} 



module.exports = {
   insert : insert
};