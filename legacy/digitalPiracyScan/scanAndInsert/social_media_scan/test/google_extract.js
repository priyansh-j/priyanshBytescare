
var fs = require('fs');
var html = fs.readFileSync('./google.html');
var cheerio = require('cheerio');
var $ = cheerio.load(html);

var engines = require('../engines');

console.log(engines['google'].extract(html));