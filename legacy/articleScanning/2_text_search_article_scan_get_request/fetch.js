//var mysql = require('mysql')
var CONFIG = require('./config.json');
const mysql = require('serverless-mysql')({
  config: {
    host     : CONFIG.database.host,
    database : 'infinity',
    user     : CONFIG.database.user,
    password : CONFIG.database.password
  }
})

async function fetch(text,callback){
var asset_id = '';
let result = '';

  /*  let results = await mysql.query("select pid from text_search where text = ? ;", [text]);
    result= results[0].pid;
    let aid_result = await mysql.query("select rid from map where pid = ? AND ptable = 'text_search' ;", [result.toString()]);
    asset_id = aid_result[0].rid;
    let asset = await mysql.query("select * from asset where pid = ?  ;", [asset_id]);
    await mysql.end()
    mysql.quit()*/


let query = `
  SELECT a.*
  FROM text_search ts
  JOIN map m ON ts.pid = m.pid AND m.ptable = 'text_search'
  JOIN asset a ON m.rid = a.pid
  WHERE ts.text = ?
`;

let results = await mysql.query(query, [text]);
//console.log(results);
//process.exit();
let asset = results[0];
await mysql.end();
mysql.quit();
  // Return the results
  return callback(null,asset);
   
   
   
   
} 

module.exports = {
   fetch : fetch
};