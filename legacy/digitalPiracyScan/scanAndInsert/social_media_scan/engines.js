const cheerio = require("cheerio");
const insert = require("./insertdb");
const set = require("./filterSet");
var engines = {};

engines.libgenrs = {
    searchURL: function (key) {
        return `https://libgen.rs/search.php?req=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let results = { state: "", results: [] };
        let no_results = $("div.no-results.td-pb-padding-side");
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 2; i < 27; i++) {
            let serp_obj = {
                ID: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(1)`).text(),
                author: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(2) > a`).text(),
                title: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a`).text(),
                source: "https://libgen.rs/" + $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a`).attr("href"),
                description: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a`).text(),
            };
            if (serp_obj.source.match("https://libgen.rs/search.php?")) {
                serp_obj.source = "https://libgen.rs/" + $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a:eq(1)`).attr("href");
            }

            if (serp_obj.source && serp_obj.source != "" && serp_obj.source != "https://libgen.rs/undefined") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.libgenis = {
    searchURL: function (key) {
        return `https://libgen.is/search.php?req=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let results = { state: "", results: [] };
        let no_results = $("div.no-results.td-pb-padding-side");
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 2; i < 27; i++) {
            let serp_obj = {
                ID: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(1)`).text(),
                author: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(2) > a`).text(),
                title: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a`).text(),
                source: "https://libgen.is/" + $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a`).attr("href"),
                description: $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a`).text(),
            };
            if (serp_obj.source.match("https://libgen.is/search.php?")) {
                serp_obj.source = "https://libgen.is/" + $(`body > table.c > tbody > tr:nth-child(${i}) > td:nth-child(3) > a:eq(1)`).attr("href");
            }
            if (serp_obj.source && serp_obj.source != "" && serp_obj.source != "https://libgen.is/undefined") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.jeemainguru = {
    searchURL: function (key) {
        return `https://jeemain.guru/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.item-details");
        let results = { state: "", results: [] };
        var no_of_results_list = [];
        $("div.td-pb-span8.td-main-content")
            .find("div.item-details")
            .each(function (index, element) {
                no_of_results_list.push($(element)); // Adding all results to get the number later
            });
        let no_results = $("div.no-results.td-pb-padding-side");
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < no_of_results_list.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h3.entry-title.td-module-title > a ").first().attr("href"),
                title: row_selector("h3.entry-title.td-module-title > a ").first().attr("title"),
                description: row_selector("div.td-excerpt ").first().text(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.facebookpg = {
    searchURL: function (key) {
        return `https://www.google.com/search?q=site:https://www.facebook.com/ ${key}&num=1000`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env) {
        let $ = cheerio.load(body);
        let organic_results = $("#center_col .g");
        let results = { state: "", results: [] };
        //TODO: CAPTCHA DETECT
        let block_text = $("div#infoDiv").text();
        if (block_text.indexOf("solve the CAPTCHA if you are using advanced terms that robots are known to use") > -1) {
            results.state = "CAPTCHA_DETECTED";
            return results;
        }

        let no_results = $(".card-section > div > b");

        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("div.yuRUbf > a").first().attr("href"),
                title: row_slector("div.yuRUbf > a > h3").first().text(),
                description: row_slector('div[data-content-feature="1"] > div').first().text(),
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            if (serp_obj.source) {
                serp_obj.source = serp_obj.source.split("/posts")[0];
            }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Top News Data
        organic_results = $("g-section-with-header > div[data-hveid]");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.WlydOe").first().attr("href"),
                title: row_slector("div.mCBkyc").first().text(),
                description: row_slector("div > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Videos Data
        organic_results = $("div.pwxRSe");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.X5OiLe").first().attr("href"),
                title: row_slector("div.uOId3b").first().text(),
                description: row_slector("div.hMJ0yc > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            console.log(results.results[0]);
            /*let fetch_results=set.set(results.results, 1, asset_id) ;
            if (fetch_results ==  null){
                return  {
                 "status": 0,
                 "state" : "DB_FETCH_ERROR_TRY_AGAIN",
                 "engine" : engine };  
              
            };
            
            insert.insert( results.results ,function(result){
            if (result==null || result == undefined){
                return  {
                 "status": 0,
                 "state" : "DB_INSERT_FAIL",
                 "engine" : engine };  
              }
            });*/
            return results.results;
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.facebook = {
    searchURL: function (key) {
        return `https://www.google.com/search?q=site:https://www.facebook.com/ ${key}&num=1000`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("#center_col .g");
        let results = { state: "", results: [] };
        //TODO: CAPTCHA DETECT
        let block_text = $("div#infoDiv").text();
        if (block_text.indexOf("solve the CAPTCHA if you are using advanced terms that robots are known to use") > -1) {
            results.state = "CAPTCHA_DETECTED";
            return results;
        }

        let no_results = $(".card-section > div > b");

        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("div.yuRUbf > a").first().attr("href"),
                title: row_slector("div.yuRUbf > a > h3").first().text(),
                description: row_slector('div[data-content-feature="1"] > div').first().text(),
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Top News Data
        organic_results = $("g-section-with-header > div[data-hveid]");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.WlydOe").first().attr("href"),
                title: row_slector("div.mCBkyc").first().text(),
                description: row_slector("div > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Videos Data
        organic_results = $("div.pwxRSe");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.X5OiLe").first().attr("href"),
                title: row_slector("div.uOId3b").first().text(),
                description: row_slector("div.hMJ0yc > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.instagram = {
    searchURL: function (key) {
        return `https://www.google.com/search?q=site:https://www.instagram.com/p/ ${key}&num=1000`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("#center_col .g");
        let results = { state: "", results: [] };
        //TODO: CAPTCHA DETECT
        let block_text = $("div#infoDiv").text();
        if (block_text.indexOf("solve the CAPTCHA if you are using advanced terms that robots are known to use") > -1) {
            results.state = "CAPTCHA_DETECTED";
            return results;
        }

        let no_results = $(".card-section > div > b");

        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("div.yuRUbf > a").first().attr("href"),
                title: row_slector("div.yuRUbf > a > h3").first().text(),
                description: row_slector('div[data-content-feature="1"] > div').first().text(),
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Top News Data
        organic_results = $("g-section-with-header > div[data-hveid]");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.WlydOe").first().attr("href"),
                title: row_slector("div.mCBkyc").first().text(),
                description: row_slector("div > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Videos Data
        organic_results = $("div.pwxRSe");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.X5OiLe").first().attr("href"),
                title: row_slector("div.uOId3b").first().text(),
                description: row_slector("div.hMJ0yc > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.bing = {
    searchURL: function (key) {
        return `https://www.bing.com/search?q=${key}&count=100`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("li.b_algo");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("li.b_no > h1");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.b_attribution").first().text(),
                title: row_selector("h2 > a").first().text(),
                description: row_selector("div.b_caption").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.duckduckgo = {
    searchURL: function (key) {
        return `https://duckduckgo.com/?q=${key}&t=ha&va=j&ia=web`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.nrn-react-div");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div.no-results t-m");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.ikg2IXiCD14iVX7AdZo1 > h2 > a").first().attr("href"),
                title: row_selector("div.ikg2IXiCD14iVX7AdZo1 > h2").first().text(),
                description: row_selector("div.OgdwYG6KE2qthn9XQWFC > span").first().text(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.freesoff = {
    searchURL: function (key) {
        return `https://freesoff.com/search?q=${key}&o=date`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.fps-topic");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div#ember52.loading-container.ember-view > h3");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://freesoff.com" + row_selector("a.search-link").first().attr("href"),
                title: row_selector("span.topic-title").first().text().replace(/\n/g, "").trim(),
                description: row_selector("span.ember-view").text().replace(/\n/g, "").trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.duforum = {
    searchURL: function (key) {
        return `https://duforum.in/search?q=${key}&o=date`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.fps-topic");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div#ember52.loading-container.ember-view > h3");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://doforum.in/" + row_selector("h3.contentRow-title > a").first().attr("href"),
                title: row_selector("span.topic-title").first().text().replace(/\n/g, "").trim(),
                description: row_selector("div.blurb.container").text().replace(/\n/g, "").trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.udemycourses = {
    searchURL: function (key) {
        return `https://udemycourses.me/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.item-inner");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("span.post-title");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h2.title > a").first().attr("href"),
                title: row_selector("h2.title").first().text().trim(),
                //description: row_selector('div.blurb container').text().replace(/\n/g, '').trim()
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.serbiumforum = {
    searchURL: function (key) {
        return `https://serbianforum.org/search/1295915/?q=${key}&o=date`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("li.js-inlineModContainer");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div.blockMessage");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://serbianforum.org/" + row_selector("h3.contentRow-title > a").first().attr("href"),
                title: row_selector("h3.contentRow-title").first().text().trim(),
                description: row_selector("div.contentRow-snippet").first().text(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.yandex = {
    searchURL: function (key) {
        return `https://yandex.com/search/?text=${key}&p=1`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        console.log($.text());
        return;
        //let organic_results = $('ul#search-result.serp-list.serp-list_left_yes');
        //let organic_results = $('ul#search-result');
        let organic_results = $("ul#search-result .serp-item_card");
        let results = { state: "", results: [] };

        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                //source: row_selector('div.VanillaReact OrganicTitle OrganicTitle_multiline Typo Typo_text_l Typo_line_m organic__title-wrapper > a').first().attr('href'),
                //.OrganicTitle-Link
                source: row_selector("div.organic__path> a").first().attr("href"),
                title: row_selector("span.organic__title").first().text(),
                //title: row_selector('div.OrganicTitle-LinkText').text(),
                //title: row_selector('div.OrganicTitleContentSpan organic__title > h2').first().text(),
                //span.OrganicTitleContentSpan
                description: row_selector("span.OrganicTextContentSpan").text(),
                //span.OrganicTextContentSpan
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.vdoc = {
    searchURL: function (key) {
        return `https://vdocuments.mx/search?q=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        //let organic_results = $('div.content_main_search');
        let organic_results = $("div.content_main_search_box");
        //let organic_results = $('div.container');
        let results = { state: "", results: [] };

        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.content_search_titel_left > a").first().attr("href"),
                title: row_selector("div.content_search_titel_left").first().text().trim(),
                description: row_selector("p").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.epdf = {
    searchURL: function (key) {
        return `https://epdf.tips/search/${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.col-lg-2.col-md-3.col-xs-6");
        let results = { state: "", results: [] };

        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.note-meta-thumb > a").first().attr("href"),
                title: row_selector("h3.note-title").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.tuxdoc = {
    searchURL: function (key) {
        return `https://tuxdoc.com/search/${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.is-3");
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        console.log($.html());
        for (let i = 0; i < organic_results.length; i++) {
            console.log("Hello");
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("p.title.is-6 > a").first().attr("href"),
                title: row_selector("p.title.is-6").first().text(),
                Description: row_selector("p.subtitle.is-7").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.qdoc = {
    searchURL: function (key) {
        return `https://qdoc.tips/search/${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.col-lg-2.col-md-3.col-xs-6");
        let results = { state: "", results: [] };

        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.note-meta-thumb > a").first().attr("href"),
                title: row_selector("h3.note-title").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.dailymotion = {
    searchURL: function (key) {
        return `https://www.dailymotion.com/search/${key}/videos`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        //let organic_results = $('div.Search__searchResultsContainer___3noSO');
        let organic_results = $("div.Card__card___2FbPd.VideoSearchCard__videoCard___25ILU.Card__nohover___FjJE7.Card__noshadow___1M4s1");
        let results = { state: "", results: [] };

        let no_results = $("div.NoSearchResults__container___Bn4NA");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://www.dailymotion.com" + row_selector("div.VideoSearchCard__videoTitle___TNod1> a").first().attr("href"),
                title: row_selector("div.VideoSearchCard__videoInfo___NpTLX").first().text(),
                description: row_selector("div.VideoSearchCard__rankViewsAndPubDate___2R7Ky").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.youtube = {
    searchURL: function (key) {
        return `https://www.youtube.com/results?search_query=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        //let organic_results = $('div.style-scope.ytd-search');
        //let organic_results = $('div.text-wrapper style-scope ytd-video-renderer')
        let organic_results = $("ytd-video-renderer.style-scope.ytd-item-section-renderer");
        let results = { state: "", results: [] };

        let no_results = $("div.NoSearchResults__container___Bn4NA");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://www.youtube.com" + row_selector("a.yt-simple-endpoint.style-scope.ytd-video-renderer").first().attr("href"),
                title: row_selector("div.style-scope.ytd-video-renderer")
                    .first()
                    .text()
                    .replace(/[\r\n]+/g, ""),
                description: row_selector("yt-formatted-string.metadata-snippet-text.style-scope.ytd-video-renderer")
                    .first()
                    .text()
                    .replace(/[\r\n]+/g, ""),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.ninescripts = {
    searchURL: function (key) {
        return `https://9scripts.com/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.item-details");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div.no-results.td-pb-padding-side");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h3.entry-title.td-module-title > a").first().attr("href"),
                title: row_selector("h3.entry-title.td-module-title").first().text().trim(),
                description: row_selector("div.td-excerpt").first().text().trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.freetutsdownload = {
    searchURL: function (key) {
        return `https://freetutsdownload.com/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("article.jeg_post.jeg_pl_md_5.format-standard");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div.jeg_posts_wrap");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h3.jeg_post_title > a").first().attr("href"),
                title: row_selector("h3.jeg_post_title").first().text().trim(),
                description: row_selector("div.jeg_post_excerpt > p").first().text().trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.jeeneetbooks = {
    searchURL: function (key) {
        return `https://www.jeeneetbooks.in/search?q={key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.date-outer");
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        console.log($.html());
        for (let i = 0; i < organic_results.length; i++) {
            console.log("Hello");
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h2.post-title.entry-title > a").first().attr("href"),
                title: row_selector("h2.post-title.entry-title").first().text(),
                description: row_selector("div.post-snippet").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.pdfslide = {
    searchURL: function (key) {
        return `https://pdfslide.net/search?q={key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.content_main_search_box");
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        console.log($.html());
        for (let i = 0; i < organic_results.length; i++) {
            console.log("Hello");
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.content_search_titel_left > a").first().attr("href"),
                title: row_selector("div.content_search_titel_left").first().text().trim(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.scribd = {
    searchURL: function (key) {
        return `https://www.scribd.com/search?query=${key}&content_type=documents&page=1`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("ul._1kBhLK._3S_oce._1gyGKg._3MyJWQ._3qn-sP._3NAnxI._2q7Jiq._3MqOhW > li > article");
        //         var no_of_results_list = [];
        //         $('ul._1kBhLK._3S_oce._1gyGKg._3MyJWQ._3qn-sP._3NAnxI._2q7Jiq._3MqOhW').find('article._9EU0Pl').each(function (index, element) {
        //         no_of_results_list.push($(element)); // Adding all results to get the number later
        //   });
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("a").first().attr("href"),
                title: row_selector("a").first().text(),
                uploader: row_selector("p.Metadata-module_subTitleTextLabel__bYC7d > span").first().text(),
                description: row_selector("a").first().text(),
                //span.OrganicTextContentSpan
            };
            console.log(serp_obj);

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.studypool = {
    searchURL: function (key) {
        return `https://www.studypool.com/notebank/search?notebank_qs=${key}&notebank_qs_university=`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.card.document");
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        console.log($.html());
        for (let i = 0; i < organic_results.length; i++) {
            console.log("Hello");
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://www.studypool.com" + row_selector("a").first().attr("href"),
                title: row_selector("span.title").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.tutbb = {
    searchURL: function (key) {
        return `https://tutbb.com/search/3721/?q={key}&o=date`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("li.block-row.block-row--separated.js-inlineModContainer");
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        console.log($.html());
        for (let i = 0; i < organic_results.length; i++) {
            console.log("Hello");
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://tutbb.com" + row_selector("div.contentRow-main > h3 > a").first().attr("href"),
                title: row_selector("h3.contentRow-title").first().text(),
                description: row_selector("div.contentRow-snippet").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.pdfdrive = {
    searchURL: function (key) {
        return `https://www.pdfdrive.com/search?q=${key}&pagecount=&pubyear=&searchin=&em=&more=true`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.row");
        //let organic_results = $('div.container');
        let results = { state: "", results: [] };

        let no_results = $("div.result-found > strong");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://www.pdfdrive.com" + row_selector("div.file-left > a").first().attr("href"),
                title: row_selector("div.file-right > a> h2").first().text(),
                description: row_selector("div.file-info").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.google = {
    searchURL: function (key) {
        return `https://www.google.com/search?q=${encodeURIComponent(key)}&num=1000`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.Gx5Zad.fP1Qef.xpd.EtOod.pkphOe");
        let results = { state: "", results: [] };
        //console.log(organic_results);
        //TODO: CAPTCHA DETECT
        let block_text = $("div#infoDiv").text();
        if (block_text.indexOf("solve the CAPTCHA if you are using advanced terms that robots are known to use") > -1) {
            results.state = "CAPTCHA_DETECTED";
            return results.state;
        }

        let no_results = $(".card-section > div > b");

        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results.state;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let encodedUrl = row_slector("div.egMi0.kCrYT > a").first().attr("href").slice(1);
            let decodedUrl = decodeURIComponent(encodedUrl);
            let serp_obj = {
                source: decodedUrl,
                title: row_slector("div.egMi0.kCrYT > a > div > div.j039Wc > h3 > div").first().text(),
                description: row_slector("div.BNeawe.s3v9rd.AP7Wnd").text(),
                //visible_link: row_selector('cite').first().text(),
                //date: row_selector('span.f').first().text()
            };

            try {
                const ampersandIndex = serp_obj.source.toString().indexOf("&");
                const qIndex = serp_obj.source.indexOf("/url?q=");
                serp_obj.source = serp_obj.source.substring(qIndex + 7, ampersandIndex);
                if (serp_obj.source && serp_obj.source != "") {
                    results.results.push(serp_obj);
                }
            } catch {
                continue;
            }
        }

        // Top News Data
        organic_results = $("g-section-with-header > div[data-hveid]");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.WlydOe").first().attr("href"),
                title: row_slector("div.mCBkyc").first().text(),
                description: row_slector("div > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        // Videos Data
        organic_results = $("div.pwxRSe");

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector("a.X5OiLe").first().attr("href"),
                title: row_slector("div.uOId3b").first().text(),
                description: row_slector("div.hMJ0yc > span").first().text() + " — Appeared",
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.google_search_by_image = {
    searchURL: function (key) {
        key = decodeURIComponent(key);
        return `https://www.google.com/searchbyimage?image_url=${key}&num=1000&site=search`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $(".ULSxyf:last-child .g");
        let results = { state: "", results: [] };

        //TODO: CAPTCHA DETECT
        let block_text = $("div#infoDiv").text();
        if (block_text.indexOf("solve the CAPTCHA if you are using advanced terms that robots are known to use") > -1) {
            results.state = "CAPTCHA_DETECTED";
            return results;
        }

        let no_results = $(".s.card-section > div > b");

        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            if (row_slector("a[ping] > div > img").length > 0) {
                let serp_obj = {
                    source: row_slector("div.yuRUbf > a").first().attr("href"),
                    title: row_slector("div.yuRUbf > a > h3").first().text(),
                    description: row_slector('div[data-content-feature="1"] > div').first().text(),
                    //visible_link: row_slector('cite').first().text(),
                    //date: row_slector('span.f').first().text()
                };

                // if (serp_obj.date) {
                //     serp_obj.date = serp_obj.date.replace(' - ', '');
                // }
                if (serp_obj.source && serp_obj.source != "") {
                    results.results.push(serp_obj);
                }
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.google_image = {
    searchURL: function (key) {
        key = decodeURIComponent(key);
        return `https://www.google.com/search?q=${key}&num=1000&tbm=isch`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.islrc > div");
        let results = { state: "", results: [] };

        //TODO: CAPTCHA DETECT
        let block_text = $("div#infoDiv").text();
        if (block_text.indexOf("solve the CAPTCHA if you are using advanced terms that robots are known to use") > -1) {
            results.state = "CAPTCHA_DETECTED";
            return results;
        }

        let no_results = $(".s.card-section > div > b");

        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }

        for (let i = 0; i < organic_results.length; i++) {
            let row_slector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_slector('a[target="_blank"]').first().attr("href"),
                title: row_slector('a[target="_blank"]').first().text(),
                description: row_slector("img").first().attr("src"),
                //visible_link: row_slector('cite').first().text(),
                //date: row_slector('span.f').first().text()
            };

            // if (serp_obj.date) {
            //     serp_obj.date = serp_obj.date.replace(' - ', '');
            // }
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.studyrate = {
    searchURL: function (key) {
        return `https://www.studyrate.in/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.search-entry-inner.clr");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div.page-content > p");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h2.search-entry-title.entry-title > a").first().attr("href"),
                title: row_selector("h2.search-entry-title.entry-title").first().text().trim(),
                description: row_selector("div.search-entry-summary.clr").first().text().trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.googledrivelinks = {
    searchURL: function (key) {
        return `https://googledrivelinks.com/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.non-grid-content.alternative-layout-content");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("div.col-12.nv-content-none-wrap");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("h2.blog-entry-title.entry-title > a").first().attr("href"),
                title: row_selector("h2.blog-entry-title.entry-title").first().text().trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.forumgoogledrivelinks = {
    searchURL: function (key) {
        return `https://forum.googledrivelinks.com/search?q=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.fps-result.ember-view");
        //let organic_results = $('ol#b_results')
        let results = { state: "", results: [] };

        let no_results = $("h3");
        //let length = 5;
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
            //return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: "https://forum.googledrivelinks.com" + row_selector("div.topic> a").first().attr("href"),
                title: row_selector("span.topic-title").first().text().trim(),
                description: row_selector("span.ember-view").text().replace(/\n/g, "").trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.jeebooks = {
    searchURL: function (key) {
        return `https://www.jeebooks.in/search?q=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.post-outer");
        let results = { state: "", results: [] };
        let no_results = $("div.status-msg-body");
        if (accurate == "1" && no_results.length > 1) {
            results.state = "NO_ACCURATE";
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("a").first().attr("href"),
                title: row_selector("a").text().trim("\n"),
                description: row_selector("div.post-snippet").first().text().trim(),
            };
            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }

        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.studymaterialz = {
    searchURL: function (key) {
        return `https://studymaterialz.in/?s=${key}`;
    },
    extract: async function (body, accurate, page, asset_id, engine, env, decrypted, tid) {
        let $ = cheerio.load(body);
        let organic_results = $("div.td_module_16.td_module_wrap.td-animation-stack");
        let results = { state: "", results: [] };
        let no_results = $(".serp-item_card > div > b");
        //let length=5;
        if (accurate == "1" && no_results.length > 0) {
            results.state = "NO_ACCURATE";
            return results;
        }
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());
            let serp_obj = {
                source: row_selector("div.td-module-thumb > a").first().attr("href"),
                title: row_selector("h3.entry-title.td-module-title").first().text(),
                description: row_selector("div.td-excerpt").first().text(),
            };

            if (serp_obj.source && serp_obj.source != "") {
                results.results.push(serp_obj);
            }
        }
        if (page == "1") {
            results.page = body;
        }
        results.state = "NORMAL";
        results.results_length = results.results.length;
        if (results.results[0] == undefined) {
            //for no search results or this will cause a sql error
            return {
                status: 0,
                results: results.results,
                engine: engine,
            };
        }
        if (results.state == "NORMAL" || results.state == "NO_ACCURATE") {
            let fetch_results = await set.set(results.results, 1, asset_id, env, decrypted);
            console.log(results.results);
            if (fetch_results == null) {
                return {
                    status: 0,
                    state: "DB_FETCH_ERROR_TRY_AGAIN",
                    engine: engine,
                };
            }

            insert.insert(results.results, asset_id, env, decrypted, tid, function (result) {
                if (result == null || result == undefined) {
                    return {
                        status: 0,
                        state: "DB_INSERT_FAIL",
                        engine: engine,
                    };
                }
            });
            return {
                status: 1,
                engine: engine,
            };
        } else {
            return {
                status: 0,
                state: results.state,
                engine: engine,
            };
        }
    },
};

engines.generic = {
    searchURL: function (key) {
        return `${key}`;
    },
    extract: function (body, accurate, page) {
        let results = {};
        results.page = body;
        results.state = "NORMAL";
        results.results = [];
        results.results_length = results.results.length;
        return results;
    },
};

module.exports = engines;
