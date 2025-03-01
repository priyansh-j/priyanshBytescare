import { BingSearch } from "./bing.js";
import { GoogleSearch } from "./googleSearch.js";
import ScrapeDuckDuckGo from "./duckduckgo.js";
import scrapeYandex from "./yandex.js";
import {yahooSearch} from "./yahoo.js";
import {yepSearch}  from "./yep.js";
import {braveSearch} from "./brave.js";
import {startPageSearch} from "./startPage.js";

import {TwitterTweetSearch} from './socialMediaCrawlers/twitter/twitterTweetSearch.js';
import {TwitterProfileSearch} from './socialMediaCrawlers/twitter/twitterProfileSearch.js';
import {LinkedInPostSearch} from './socialMediaCrawlers/linkedin.js';
import {FacebookPostSearch} from './socialMediaCrawlers/facebook.js';
import {InstagramPostSearch} from './socialMediaCrawlers/instagram.js';

import { flipkartSearch} from "./ecomCrawlers/flipkart.js";
import { ecomGoogleSearch} from "./ecomCrawlers/ecomGoogleSearch.js";
import { amazonSearch} from "./ecomCrawlers/amazon.js";
import { aibhSearch} from "./ecomCrawlers/aibh.js";
import { bookswagonSearch} from "./ecomCrawlers/bookswagon.js";
import { snapdealSearch} from "./ecomCrawlers/snapdeal.js";
import { sapnaOnlineSearch} from "./ecomCrawlers/sapnaOnline.js";
import { paytmSearch} from "./ecomCrawlers/paytm.js";
import { meeshoSearch} from "./ecomCrawlers/meesho.js";

import {TwitterTweetSearch} from './twitter/twitterTweetSearch.js';
import {TwitterProfileSearch} from './twitter/twitterProfileSearch.js';


/**
 * @param {*} page
 * @param {*} keyword
 * @param {*} platform
 * 
 * Should always return an Array or throw Error.
 * @returns [Object]
 * */
export default async function scrape(page, keyword, platform) {
    let url;
    switch (platform) {
       
        case "googleSearch":
            return await GoogleSearch(keyword, page);
        case "bing":
            return await BingSearch(keyword, page);
        case "duckduckgo":
            return await ScrapeDuckDuckGo(page, keyword);
        case "yandex":
            return await scrapeYandex(page, keyword);
        case "yahoo":
            return await yahooSearch(page, keyword);
        case "yep":
            return await yepSearch(page, keyword);
        case "brave":
            return await braveSearch(page, keyword);
        case "startPage":
            return await startPageSearch(page, keyword); 
        case "flipkart":
            return await flipkartSearch(page,keyword);   
        case "amazon":
            return await amazonSearch(page,keyword); 
        case "flipkart_googleSearch":
            url = `https://www.google.com/search?q=site:https://www.flipkart.com/ ${keyword}&num=1000`;
            return await ecomGoogleSearch(page,url); 
        case "amazon_googleSearch":
            url = `https://www.google.com/search?q=site:https://www.amazon.com/ ${keyword}&num=1000`;
            return await ecomGoogleSearch(page,url); 
        case "aibh":
            return await aibhSearch(page,keyword);
        case "bookswagon":
            return await bookswagonSearch(page,keyword);
        case "snapdeal":
            return await snapdealSearch(page,keyword);
        case "sapnaOnline":
                return await sapnaOnlineSearch(page,keyword);
        case "paytm":
            return await paytmSearch(page,keyword);
        case "meesho":
            return await meeshoSearch(page,keyword);     
        case "twitterTweet":
            return await TwitterTweetSearch(page, keyword);
        case "twitterProfile":
            return await TwitterProfileSearch(page, keyword);
        case "linkedinPost":
            return await LinkedInPostSearch(page, keyword);
        case "facebookPost":
            return await FacebookPostSearch(page, keyword);
        case "instagramPost":
            return await InstagramPostSearch(page, keyword);
        
        default:
            console.log(`${platform} not implemented.`);
            return [];
    }
}
