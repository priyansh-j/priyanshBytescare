const cheerio = require('cheerio');
const { v3: uuidv3 } = require('uuid');
var fetch = require('./fetch');
var request = require('request');
var engines = {};
var asset = '';
var CONFIG = require('./config.json');
const mysql = require('serverless-mysql')({
  config: {
    host     : CONFIG.database.host,
    database : 'infinity',
    user     : CONFIG.database.user,
    password : CONFIG.database.password
  }
})

engines.google = {
    searchURL:  function (key) {
        return `https://www.google.com/search?q=${encodeURIComponent(key)}&num=1000`;
    },
    extract: async function (body, accurate, page,asset_id,engine,label,callback) {
        let arr_params = []       
        let $ = cheerio.load(body);
        //return callback($.html())
        let organic_results = $('div.kCrYT');
        console.log(organic_results.text())
        let results = { state: '', results: [] };
        //console.log(organic_results);
        //TODO: CAPTCHA DETECT
        
        let no_results = $('.card-section > div > b');

        if (accurate == '1' && no_results.length > 0) {
            results.state = 'NO_ACCURATE'
            return results;
        }

        for (let i = 0; i < organic_results.length -1 ; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            //return callback(null,row_slector.html())
        let serp_obj = {
            source: row_slector('a').first().attr('href'),
            title: row_slector('.BNeawe.vvjwJb.AP7Wnd').text(),
            description: row_slector('div[data-content-feature="1"] > div').first().text(),
            label: label
            //visible_link: row_selector('cite').first().text(),
            //date: row_selector('span.f').first().text()
        };
        // Extract the desired URL from serp_obj.source
        try{
        const ampersandIndex = serp_obj.source.toString().indexOf("&");
        const qIndex = serp_obj.source.indexOf("/url?q=");
        serp_obj.source = serp_obj.source.substring(qIndex + 7, ampersandIndex);
            if (serp_obj.source && serp_obj.source != '') {
                results.results.push(serp_obj);
                            }
                            
        }
        catch{continue;}
        }

        // Top News Data
        organic_results = $('g-section-with-header > div[data-hveid]');

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector('a.WlydOe').first().attr('href'),
                title: row_slector('div.mCBkyc').first().text(),
                description: row_slector('div > span').first().text() + " — Appeared",
                label: label
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != '') {
                results.results.push(serp_obj);
                
            }
        }


        // Videos Data
        organic_results = $('div.pwxRSe');

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector('a.X5OiLe').first().attr('href'),
                title: row_slector('div.uOId3b').first().text(),
                description: row_slector('div.hMJ0yc > span').first().text() + " — Appeared",
                label: label
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };
            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != '') {
                results.results.push(serp_obj);
                
            }
        }
        
        if (page == '1') {
            results.page = body;
        }
        results.state = 'NORMAL';
        results.results_length = results.results.length;
         if (results.results[0] == undefined) {
             //for no search results or this will cause a sql error
             //return callback(null,$.html())
             return callback(null,arr_params);
         }
        if (results.state == 'NORMAL' || results.state == 'NO_ACCURATE' ) {
           // console.log(results.results)
            await fetch.fetch( asset_id ,function(err,result){
              if (err)
                throw err;
              asset = result;
              
                
            });
            var aid = asset.pid ;
            let length = results.results.length;
            let count_results ;
            /*for (var len= count_results - 1 ; len >=0; len --)
              {
               let pid = uuidv3(results.results[len].source + '#search-' + '1' + '-' + aid, uuidv3.URL);  
               let results_search = await mysql.query("select * from search where pid = ? ;", [pid]);  
               if (results_search.length == 0 || results_search[0] == '')
                 results.results[len].splice(len, 1);
                  
              }*
            
            console.log("results ",aid);
           /* let myJSONObject = {"queryStringParameters":  { "results" : results.results[5], "aid" : aid } } 
            request({
            url: "https://d35psdl5rj.execute-api.ap-south-1.amazonaws.com/default/article_scan_level_2_filters",
            method: "POST",
            json: true,   // <--Very important!!!
            body: myJSONObject
        }, function (error, response, body){
            console.log(response);
            //console.log("Hello");
            
        });*/
   
   for (var count = 0; count < results.results.length ; count ++){   
            let myJSONObject = {"queryStringParameters":  { "results" : results.results[count], "aid" : aid } } 
            arr_params.push(myJSONObject)}
   return callback(null,arr_params);
   for (var count = 0; count < results.results.length ; count ++){   
            let myJSONObject = {"queryStringParameters":  { "results" : results.results[count], "aid" : aid } } 
            request({
            url: "https://d35psdl5rj.execute-api.ap-south-1.amazonaws.com/default/article_scan_level_2_filters",
            method: "POST",
            json: true,   // <--Very important!!!
            body: myJSONObject
        }, function (error, response, body){
            //console.log(response);
            console.log("Hello");
            
        });}
            //let fetch_results =  await set.set(results.results, 1, asset_id) ;
            
            //if (fetch_results ==  null){
              //  return  {
                // "status": 0,
                // "state" : "DB_FETCH_ERROR_TRY_AGAIN",
                // "engine" : engine };  
              
            //};
            /*insert.insert( results.results ,asset_id,function(result){
            if (result==null || result == undefined){
                return  {
                 "status": 0,
                 "state" : "DB_INSERT_FAIL",
                 "engine" : engine };  
              }
            });*/
             return    {
                 "status": 1,
                 "engine" : engine
             };
         }
        else { 
                return  {
                 "status": 0,
                 "state" : results.state,
                 "engine" : engine
             };  
            }  
            }
            
};

engines.yandex = {
    searchURL: function (key) {
        return `https://yandex.com/search/?text=${key}&p=1`;
    },
    extract: async function (body, accurate, page,asset_id,engine,label,callback) {
        let arr_params = [];
        let $ = cheerio.load(body);
        //let organic_results = $('ul#search-result.serp-list.serp-list_left_yes');
        //let organic_results = $('ul#search-result');
        let organic_results = $('ul#search-result .serp-item_card');
        let results = { state: '', results: [] };
  
        let no_results = $('.serp-item_card > div > b');
        //let length=5;
        if (accurate == '1' && no_results.length > 0) {
            results.state = 'NO_ACCURATE'
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                //source: row_selector('div.VanillaReact OrganicTitle OrganicTitle_multiline Typo Typo_text_l Typo_line_m organic__title-wrapper > a').first().attr('href'),
                //.OrganicTitle-Link
                source: row_selector('div.organic__path> a').first().attr('href'),
                title: row_selector('span.organic__title').first().text(),
                //title: row_selector('div.OrganicTitle-LinkText').text(),
                //title: row_selector('div.OrganicTitleContentSpan organic__title > h2').first().text(),
                //span.OrganicTitleContentSpan
                description: row_selector('span.OrganicTextContentSpan').text(),
                label: label
                //span.OrganicTextContentSpan
            };
            
            if (serp_obj.source && serp_obj.source != '') {
                results.results.push(serp_obj);
            }
        }
        
        if (page == '1') {
            results.page = body;
        }
        results.state = 'NORMAL';
        results.results_length = results.results.length;
         if (results.results[0] == undefined) {
             //for no search results or this will cause a sql error
             //return callback(null,$.html())
             return callback(null,arr_params);
         }
        if (results.state == 'NORMAL' || results.state == 'NO_ACCURATE' ) {
           // console.log(results.results)
            await fetch.fetch( asset_id ,function(err,result){
              if (err)
                throw err;
              asset = result;
              
                
            });
            console.log("aid",aid);
            var aid = asset.pid ;
            let length = results.results.length;
            let count_results ;
            /*for (var len= count_results - 1 ; len >=0; len --)
              {
               let pid = uuidv3(results.results[len].source + '#search-' + '1' + '-' + aid, uuidv3.URL);  
               let results_search = await mysql.query("select * from search where pid = ? ;", [pid]);  
               if (results_search.length == 0 || results_search[0] == '')
                 results.results[len].splice(len, 1);
                  
              }*
            
            console.log("results ",aid);
           /* let myJSONObject = {"queryStringParameters":  { "results" : results.results[5], "aid" : aid } } 
            request({
            url: "https://d35psdl5rj.execute-api.ap-south-1.amazonaws.com/default/article_scan_level_2_filters",
            method: "POST",
            json: true,   // <--Very important!!!
            body: myJSONObject
        }, function (error, response, body){
            console.log(response);
            //console.log("Hello");
            
        });*/
   
   for (var count = 0; count < results.results.length ; count ++){   
            let myJSONObject = {"queryStringParameters":  { "results" : results.results[count], "aid" : aid } } 
            arr_params.push(myJSONObject)}
   return callback(null,arr_params);
   for (var count = 0; count < results.results.length ; count ++){   
            let myJSONObject = {"queryStringParameters":  { "results" : results.results[count], "aid" : aid } } 
            request({
            url: "https://d35psdl5rj.execute-api.ap-south-1.amazonaws.com/default/article_scan_level_2_filters",
            method: "POST",
            json: true,   // <--Very important!!!
            body: myJSONObject
        }, function (error, response, body){
            //console.log(response);
            console.log("Hello");
            
        });}
            //let fetch_results =  await set.set(results.results, 1, asset_id) ;
            
            //if (fetch_results ==  null){
              //  return  {
                // "status": 0,
                // "state" : "DB_FETCH_ERROR_TRY_AGAIN",
                // "engine" : engine };  
              
            //};
            /*insert.insert( results.results ,asset_id,function(result){
            if (result==null || result == undefined){
                return  {
                 "status": 0,
                 "state" : "DB_INSERT_FAIL",
                 "engine" : engine };  
              }
            });*/
             return    {
                 "status": 1,
                 "engine" : engine
             };
         }
        else { 
                return  {
                 "status": 0,
                 "state" : results.state,
                 "engine" : engine
             };  
            }  
            }
            
};

module.exports = engines;
