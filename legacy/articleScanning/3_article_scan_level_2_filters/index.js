const chromium = require('chrome-aws-lambda');
var AWS = require('aws-sdk');
const fs = require("fs");
var path = require('path');
var filters = require('./filterset.js');
var insert = require('./inserdb.js');


String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

exports.handler = async (event, context, callback) => {
   var collection = [];
   var urls = {}    
   urls = event.queryStringParameters.results
   collection.push(urls);
   var asset_id =  event.queryStringParameters.aid
   var results = await filters.set(collection,1,asset_id);
   insert.insert( results ,asset_id,function(result){
            if (result==null || result == undefined){
                return  {
                 "status": 0,
                 "state" : "DB_INSERT_FAIL"};  
              }
            });

    return callback(null, results);

};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully..");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};