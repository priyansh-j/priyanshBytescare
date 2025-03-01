var filterUtils = require('./filters');
//const uuidv3 = require('uuid/v3');
const { v3: uuidv3 } = require('uuid');
var fetch = require('./fetch');
var asset = '';


async function set (data, type, aid,env,decrypted) {
 let asset_id = aid ;
await fetch.fetch( asset_id ,env, decrypted,function(err,result){
    if (err)
      throw err;
    asset = result;
    console.log("asset",result);})
 
   
   if (asset.length > 0) {
        asset =  asset.map((el) => { el.advanced = JSON.parse(el.advanced); return Object.assign({}, el); });
        const level = 1; // Primary Data (Phase 1)
        const filters = new filterUtils(asset[0], level, type);
        return filters.filter_all(data.filter(el => (el != null && el != undefined && el.source != null && el.source != undefined)).map(el => {
            el.pid = uuidv3(el.source + '#search-' + type + '-' + asset[0].pid, uuidv3.URL);
            el.title = el.title.replace(/[\u0800-\uFFFF]/g, '');
            el.description = el.description ? el.description.replace(/[\u0800-\uFFFF]/g, '') : el.description;
            el.text = asset[0].text
            return el;
        })); 
    } 
    
   
    else {
        try{
       return data.filter(el => (el != null && el != undefined && el.source != null && el.source != undefined)).map(el => {
            el.pid = uuidv3(el.source + '#search-' + type + '-' + asset[0].pid, uuidv3.URL);
            el.title = el.title.replace(/[\u0800-\uFFFF]/g, '');
            el.description = el.description ? el.description.replace(/[\u0800-\uFFFF]/g, '') : el.description;
             el.text = asset[0].text
            return el;
        });}
        catch{
            console.log("asset",String.fromCharCode(parseInt(asset, 16)) + "hello");
            return null;
        }
    }

    
} 

module.exports= {set : set }