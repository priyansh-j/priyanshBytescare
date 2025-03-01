var mysql = require('mysql')
async function insert(el, asset_id, env, decrypted,callback){

    if (env == 'dev'){
        let arr = [];
        let date;
        date = new Date();
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
        
        for (let i = 0; i < el.length; i++) {
            //arr.push([el[i].pid, el[i].title, el[i].source, "NA",el.type,"NA", date, date, 0.0, 0,999,null]) ;
            arr.push([el[i].pid, el[i].title, el[i].source, el[i].description , date, date,el[i].score, el[i].prediction,el[i].rejected_by,null]) 
            ;}
        var con = await mysql.createConnection({
            host: process.env.db_host_dev,
            user: process.env.database_username_dev,
            password: decrypted,
            database : process.env.database,
            requestTimeout: 180000
          });  
          con.connect(function(err) {
          if (err) throw err;
          });
        
        await con.query('insert ignore into search values?', [arr],  async function (err, result, fields) {
              if (err) {throw err};
              var map_array =[];
              for (let i = 0; i < el.length; i++) {
              map_array.push( [el[i].pid, asset_id,date,"asset_search"]);}
              await con.query('insert ignore into map values?', [map_array], function (err, results, fieldss) {
              if (err) {throw err};});
              con.commit();
              con.end();
              return callback(result);
      
    });
    
}

else if (env == 'prod'){
 
    
          let arr = [];
        let date;
        date = new Date();
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
        
        for (let i = 0; i < el.length; i++) {
            //arr.push([el[i].pid, el[i].title, el[i].source, "NA",el.type,"NA", date, date, 0.0, 0,999,null]) ;
             arr.push([el[i].pid, el[i].title, el[i].source, el[i].description , date, date,el[i].score, el[i].prediction,el[i].rejected_by,null]) 
            ;}
        var con = await mysql.createConnection({
            host: process.env.db_host_prod,
            user: process.env.database_username_prod,
            password: decrypted,
            database : process.env.database,
            requestTimeout: 180000
          });  
          con.connect(function(err) {
          if (err) throw err;
          });
        
        
        await con.query('insert ignore into search values?', [arr],  async function (err, result, fields) {
              if (err) {throw err};
              var map_array =[];
              for (let i = 0; i < el.length; i++) {
              map_array.push( [el[i].pid, asset_id,date,"asset_search"]);}
              await con.query('insert ignore into map values?', [map_array], function (err, results, fieldss) {
              if (err) {throw err};});
              con.commit();
              con.end();
              return callback(result);
      
    });
      
    
    
 }



}

module.exports = {
   insert : insert
};