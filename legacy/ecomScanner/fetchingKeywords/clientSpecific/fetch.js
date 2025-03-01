let keyword = '' ;
const async = require('async');
const http =  require("https")
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

async function fetch(rid,date_init,date_final,crawler_list, env, decrypted,callback){
 if (env == "dev"){    

      const mysql = require('serverless-mysql')({
      config: {
      host     : process.env.db_host_dev,
      database : process.env.database,
      user     :  process.env.database_username_dev,
      password : decrypted
                }
            })
      let date;
      date = new Date();
      date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' + 
        ('00' + date.getUTCHours()).slice(-2) + ':' + 
        ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
        ('00' + date.getUTCSeconds()).slice(-2);
      
      let results = await mysql.query("SELECT DISTINCT text_search.pid as tid , interface.asset_info.official_name, asset.pid as aid,  interface.map.ptable as ptable, interface.map.rid as cid , infinity.text_search.text as text , infinity.map.pid as infrid FROM asset INNER JOIN interface.map ON asset.pid = map.pid  INNER JOIN infinity.map  ON asset.pid = infinity.map.rid INNER JOIN interface.asset_info on infinity.asset.pid = interface.asset_info.pid INNER JOIN infinity.text_search ON text_search.pid = infinity.map.pid where interface.map.rid = ? and interface.map.ptable like 'asset' ", [rid]);
      //process.exit()
      date = convertTZ(date)
      //await mysql.end()
      //return callback(null,pids)
      var numRows = results.length
      let assetData = []
      console.log(numRows);
        
            try{
               let count;    
               let numrows = results.length;
               for (count = 0; count < numRows ; count ++)
                {
                    for(let crawlers = 0 ; crawlers < crawler_list.length ; crawlers++)
                             {  
                                var minimum_price = results[count].official_name.split("|")[2]
                                var input_price = results[count].official_name.split("|")[1]
                                var isbn13 = results[count].official_name.split("|")[3]
                                var isbn10 = results[count].official_name.split("|")[4]
                                var text = results[count].text ;
                                var asset_id = results[count].aid;
                                var tid = results[count].tid;
                                var single_hit_uri = `https://64uu68x5k3.execute-api.ap-south-1.amazonaws.com/default/social_media_scan_single_hit?aid=${asset_id}&key=${text[0].text}` ;
                                let obj = {}
                                obj.aid = asset_id;
                                obj.minimum_price = minimum_price;
                                obj.input_price = input_price;
                                obj.isbn13 = isbn13;
                                obj.isbn10 = isbn10;
                                obj.tid = tid ;
                                obj.key = text;
                                obj.crawler_list = [crawler_list[crawlers]]
                                obj.env= env;
                                assetData.push(obj);
                                } 
                } 
                
            
                
            }
                  

            catch(err){
                    console.log(err)
            }
                  
                
              
      await mysql.end()
      mysql.quit()
      // Return the results
      return callback(null,assetData)
      
 }
 
 else if (env =="prod"){


      const mysql = require('serverless-mysql')({
      config: {
      host     : process.env.db_host_prod,
      database : process.env.database,
      user     :  process.env.database_username_prod,
      password : decrypted
                }
            })
      let date;
      date = new Date();
      date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' + 
        ('00' + date.getUTCHours()).slice(-2) + ':' + 
        ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
        ('00' + date.getUTCSeconds()).slice(-2);
      
      let results = await mysql.query("SELECT DISTINCT text_search.pid as tid , interface.asset_info.official_name, asset.pid as aid,  interface.map.ptable as ptable, interface.map.rid as cid , infinity.text_search.text as text , infinity.map.pid as infrid FROM asset INNER JOIN interface.map ON asset.pid = map.pid  INNER JOIN infinity.map  ON asset.pid = infinity.map.rid INNER JOIN interface.asset_info on infinity.asset.pid = interface.asset_info.pid INNER JOIN infinity.text_search ON text_search.pid = infinity.map.pid where interface.map.rid = ? and interface.map.ptable like 'asset' ", [rid]);
      //process.exit()
      date = convertTZ(date)
      //await mysql.end()
      //return callback(null,pids)
      var numRows = results.length
      let assetData = []
      console.log(numRows);
        
            try{
               let count;    
               let numrows = results.length;
               for (count = 0; count < numRows ; count ++)
                {
                    for(let crawlers = 0 ; crawlers < crawler_list.length ; crawlers++)
                             {  
                                var minimum_price = results[count].official_name.split("|")[2]
                                var input_price = results[count].official_name.split("|")[1]
                                var isbn13 = results[count].official_name.split("|")[3]
                                var isbn10 = results[count].official_name.split("|")[4]
                                var text = results[count].text ;
                                var asset_id = results[count].aid;
                                var tid = results[count].tid;
                                var single_hit_uri = `https://64uu68x5k3.execute-api.ap-south-1.amazonaws.com/default/social_media_scan_single_hit?aid=${asset_id}&key=${text[0].text}` ;
                                let obj = {}
                                obj.aid = asset_id;
                                obj.minimum_price = minimum_price;
                                obj.input_price = input_price;
                                obj.isbn13 = isbn13;
                                obj.isbn10 = isbn10;
                                obj.tid = tid ;
                                obj.key = text;
                                obj.crawler_list = [crawler_list[crawlers]]
                                obj.env= env;
                                assetData.push(obj);
                                } 
                } 
                
            
                
            }
                  

            catch(err){
                    console.log(err)
            }
                            
                
                
              
      await mysql.end()
      mysql.quit()
      return callback(null,assetData)
 }
 

};

module.exports = {
   fetch : fetch
};