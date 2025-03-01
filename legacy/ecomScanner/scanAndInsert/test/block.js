
var fs = require('fs');
var html = fs.readFileSync('./block.html');
var cheerio = require('cheerio');
var $ = cheerio.load(html);

let block_text = $('div#infoDiv').text();

if (block_text.indexOf('solve the CAPTCHA if you are using advanced terms that robots are known to use') > -1) {
    console.log('CAPTCHA_DETECTED');
}
