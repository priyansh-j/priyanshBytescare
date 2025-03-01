'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'ap-south-1'});
const set = require('./filterSet'); 
const insert = require('./inserdb');
const fuzzball = require('fuzzball');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
function preprocessTitle(title) {
  title = title.toLowerCase();
  title = title.replace(/[^a-z\s]/g, ''); // Remove special characters and numbers
  const words = tokenizer.tokenize(title);
  const stopWords = new Set(natural.stopwords);
  const filteredWords = words.filter((word) => !stopWords.has(word));
  return filteredWords.join(' ');
}
function filterBooks(searchTitle, bookListings, similarityThreshold = 80) {
  const preprocessedSearchTitle = preprocessTitle(searchTitle);
  const filteredBooks = [];
  for (const book of bookListings) {
    const preprocessedBookTitle = preprocessTitle(book.title);
    const similarity = fuzzball.token_set_ratio(preprocessedSearchTitle, preprocessedBookTitle);
    if (similarity >= similarityThreshold) {
      filteredBooks.push(book,similarity);
    }
  }
  return filteredBooks;
}

async function extract (bucket_path, aid,env,decrypted,tid) {

    
    let bucket =  'credentials-db-new';
    let file =  bucket_path;

    let data = await s3.getObject({
        Bucket: bucket,
        Key: file
    }).promise();

    let results = {
        body: JSON.parse(data.Body.toString())
    };
        
    if (results.body.length == 0 )
         return    {
                 "status": 0
             };
    let fetch_results=   await set.set(results.body, 2, aid,env,decrypted) ;
    //console.log(fetch_results);
    for (var len=fetch_results.length - 1 ; len >=0; len --)
 
    {  const searchTitle = fetch_results[len]['title'].split("|")[0].replace("TITLE - ","").toLowerCase().trim();
       const text =  fetch_results[len]['text'].toLowerCase().trim();
       var bookListings = []
       let obj = {}
       obj.title = text
       bookListings.push(obj);
       const score_array = filterBooks(searchTitle, bookListings);
      //console.log(score_array)
       fetch_results[len]['score'] = (score_array[1]/100)  ;
       if (fetch_results[len]['score'] >= 0.8  && fetch_results[len]['score'] <=1)
           fetch_results[len]['prediction'] = 1;
       const filteredBooks = filterBooks(searchTitle, bookListings);
       if (filteredBooks.length == 0 || filterBooks[0] == '')
          fetch_results.splice(len, 1);

    }
    let engine = bucket_path.split("/")[3]
    if (fetch_results.length ==0 )
              return    {
                 "status": 2
             };
    insert.insert( fetch_results , aid, env, decrypted, engine, tid, function(result){
            if (result==null || result == undefined){
                return  {
                 "status": 0,
                 "state" : "DB_INSERT_FAIL"
                        };  
              }
            });
            return    {
                 "status": 1
             };
 
} 

module.exports= {extract : extract }