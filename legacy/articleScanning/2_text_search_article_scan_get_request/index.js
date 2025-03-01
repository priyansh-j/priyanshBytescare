let engines = require("./engines");
var AWS = require('aws-sdk');
const fs = require("fs");
var path = require('path');
const request =  require("request");
var s3 = new AWS.S3();
const BUCKET = "text-marker";
const cheerio = require('cheerio');
let result = ''
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

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
 }


exports.handler = async (event, context, callback) => {

        
        try {
                /*browser = await chromium.puppeteer.launch({
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath,
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true,
            });*/

        //let page = await browser.newPage();
        let engine = engines[event.queryStringParameters.engine];
        let url = engine.searchURL(event.queryStringParameters.aid);
            const options = {
        url: url,
        method: 'GET',
        headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'Mozilla/5.0'
    },
     timeout: 10000
};


  let result_page = await new Promise((resolve, reject) => { request(options, function(err, res, body) {
     if (err) return reject(err);  
    return resolve(body);
  })
}); 
console.log("reached here")
await engine.extract( result_page, event.queryStringParameters.accurate, event.queryStringParameters.page, event.queryStringParameters.aid,event.queryStringParameters.engine, event.queryStringParameters.scan_label,function(err,results){
            if (err)
        throw err;
        console.log(results)
        result = results
        //console.log("asset",result);
    //console.log(decrypted);
        
        })
    } catch (error) {
        return callback(error);
    } 
    return callback(null, result);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}





