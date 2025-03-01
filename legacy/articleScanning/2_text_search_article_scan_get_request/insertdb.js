var mysql = require('mysql')
var CONFIG = require('./config.json');


async function insert(el,asset_id,callback){
let arr = [];
var date;
date = new Date();
date = date.getUTCFullYear() + '-' +
    ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
    ('00' + date.getUTCDate()).slice(-2) + ' ' + 
    ('00' + date.getUTCHours()).slice(-2) + ':' + 
    ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
    ('00' + date.getUTCSeconds()).slice(-2);

for (let i = 0; i < el.length; i++) {
    arr.push([el[i].pid, el[i].title, el[i].source, el[i].description, date, date, el[i].score, el[i].prediction,el[i].rejected_by,null]) ;}
var con = mysql.createConnection({
    host: CONFIG.database.host,
    user: CONFIG.database.user,
    password: CONFIG.database.password,
    database : 'infinity'
  });  
   con.connect(function(err) {
  if (err) throw err;
  });
    con.query('insert ignore into search values?', [arr],  async function (err, result, fields) {
      if (err) {throw err};
      var map_array =[];
      for (let i = 0; i < el.length; i++) {
      map_array.push( [el[i].pid, asset_id,date,"asset_search"]);}
      await con.query('insert ignore into map values?', [map_array], function (err, results, fieldss) {
      if (err) {throw err};});
      con.end();
      return callback(result);
      
    });

} 



module.exports = {
   insert : insert
};