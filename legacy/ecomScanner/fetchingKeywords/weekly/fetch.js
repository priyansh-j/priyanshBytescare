
const async = require('async');
const http =  require("https")
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

async function fetch(date_init,date_final,crawler_list, env, decrypted,callback){
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
      
      //let results = await mysql.query("select * from map where inserted_at >= ? and inserted_at <= ? and ptable not like 'asset_%' ;",[ date_init , date_final]);
      let results = await mysql.query("select text_search.pid as tid , interface.asset_info.official_name,asset.expiry,asset.cycle,asset.type, asset.text as atext, asset.pid, map.pid as mid, text_search.text as text, text_search.type as ktype from infinity.asset INNER JOIN interface.asset_info on infinity.asset.pid = interface.asset_info.pid INNER JOIN map ON asset.pid = map.rid  INNER JOIN text_search ON map.pid  = text_search.pid  where map.ptable not like 'asset_%'  and text_search.type not like '%_social' ", [ date_init , date_final]);
      date = convertTZ(date)
      await mysql.end()
      var numRows = results.length
      let assetData = []
      //console.log("j", results);
      for (let count = 0 ; count<  numRows ; count++ )
      {    
        
            try{
                if (results[count].cycle == 1701 && (results[count].expiry > date ) && ((results[count].type == 'movie' || results[count].type == 'brand_content' || results[count].type == 'brand_trademark'|| results[count].type == 'book' || results[count].type == 'brand' )))
                                {
                                for(let crawlers = 0 ; crawlers < crawler_list.length ; crawlers++)
                            {  
                                var minimum_price = results[count].official_name.split("|")[2]
                                var input_price = results[count].official_name.split("|")[1]
                                var isbn13 = results[count].official_name.split("|")[3]
                                var isbn10 = results[count].official_name.split("|")[4]
                                var text = results[count].text ;
                                var tid = results[count].tid;
                                var asset_id = results[count].pid;
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
                    continue;
                            }
                
                
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
      
      //let results = await mysql.query("select * from map where inserted_at >= ? and inserted_at <= ? and ptable not like 'asset_%' ;",[ date_init , date_final]);
      let results = await mysql.query("select text_search.pid as tid , interface.asset_info.official_name,asset.expiry,asset.cycle,asset.type, asset.text as atext, asset.pid, map.pid as mid, text_search.text as text, text_search.type as ktype from interface.asset INNER JOIN interface.asset_info on interface.asset.pid = interface.asset_info.pid INNER JOIN map ON asset.pid = map.rid  INNER JOIN text_search ON map.pid  = text_search.pid  where map.ptable not like 'asset_%'  and text_search.type not like '%_social' ", [ date_init , date_final]);
      date = convertTZ(date)
      await mysql.end()
      var numRows = results.length
      let assetData = []
      console.log("j", numRows);
      for (let count = 0 ; count<  numRows ; count++ )
      {  
        
            try{
                if (results[count].cycle == 1701 && (results[count].expiry > date )  && ((results[count].type == 'movie' || results[count].type == 'brand_content' || results[count].type == 'brand_trademark'|| results[count].type == 'book' || results[count].type == 'brand')) )
                                {
                            
                            for(let crawlers = 0 ; crawlers < crawler_list.length ; crawlers++)
                            {
                                var minimum_price = results[count].official_name.split("|")[2]
                                var input_price = results[count].official_name.split("|")[1]
                                var isbn13 = results[count].official_name.split("|")[3]
                                var isbn10 = results[count].official_name.split("|")[4]
                                var text = results[count].text ;
                                var tid = results[count].tid;
                                var asset_id = results[count].pid;
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
                    continue;
                            }
                
                
              }
      await mysql.end()
      mysql.quit()
      // Return the results
      return callback(null,assetData)
 }
 

};

module.exports = {
   fetch : fetch
};