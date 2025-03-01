import urlParser from "url";
import checkWord from "check-word";
import _ from "lodash";
import request from "request";

import { valid_source, sourceList, status, rejected_by } from "./constants.js";
import {
    url_pattern,
    meta,
    game_list,
    broadcaster_list,
    live_path,
    highlights_path,
    live_path_text,
    highlights_path_text,
    brands,
    sports,
    sports_team_exclusions,
    education,
    politics,
    travel,
    health,
    exclusions_domain,
    fake_domain,
    physical_domain,
    publisher_domain,
    fake_auto,
    lang,
    common,
    common_non_book,
    common_level_2,
    bad_protocols,
    keywords_primary,
    keywords_secondary,
    date,
    needed,
    append_asset,
} from "./patterns.js";

let words = checkWord("en");

/*
 * Common Filter Function
 * URL Fixer
 * HTML Asset Checker - Request URL For URL Content Type
 * Score to Human Readable
 */
let fixURL = function (url) {
    if (!url) return url;
    if (url.indexOf("//") === 0) {
        url = "http:" + url;
    }
    if (url.indexOf("/safety/?url=") === 0) {
        url = url.split("/safety/?url=")[1];
        if (url.search(/https?:\/\//gi) < 0) {
            url = "http://" + url;
        }
    }
    if (url.indexOf("http://https//") === 0 || url.indexOf("https://https//") === 0) {
        url = url.split("https//").join("");
    }
    if (url.indexOf("http://http//") === 0 || url.indexOf("https://http//") === 0) {
        url = url.split("http//").join("");
    }
    url = url.replace(/\s.*/gi, "");
    return url;
};

let fixAsset = function (list) {
    // Similar Keyword Inclusion
    if (list.indexOf("fifa") > -1 || list.indexOf("football") > -1) {
        list.push("fifa");
        list.push("football");
    }
    if (list.indexOf("cricket") > -1 || list.indexOf("odi") > -1 || list.indexOf("test") > -1 || list.indexOf("t20") > -1) {
        list.push("cricket");
        list.push("t20");
        list.push("odi");
        list.push("test");
    }
    return list;
};

let filter_html_asset = async function (url) {
    try {
        data = await checkHeader(url);
        if (data.statusCode === 404) {
            // Reject NOT Found URL Straight Away
            return {
                verdict: true,
                rejected_by: rejected_by.NOT_FOUND,
            };
        }
        if (data.headers["content-type"].search(/image|css|javascript/gi) > -1) {
            return {
                verdict: true,
                rejected_by: rejected_by.LEVEL2_HTML_ASSET,
            };
        }
        return {
            verdict: false,
            rejected_by: rejected_by.NONE,
        };
    } catch (err) {
        return {
            verdict: false,
            rejected_by: rejected_by.NONE,
        };
    }
};

let getAllSubstrings = function (str, size) {
    let i,
        j,
        result = [];
    size = size || 0;
    for (i = 0; i < str.length; i++) {
        for (j = str.length; j - i >= size; j--) {
            result.push(str.slice(i, j));
        }
    }
    return result;
};

let confidence = function (score) {
    if (score >= 1) {
        return "(A) Very High";
    }
    if (score < 1 && score >= 0.8) {
        return "(B) Moderately High";
    }
    if (score < 0.8 && score >= 0.6) {
        return "(C) Medium";
    }
    if (score < 0.6 && score >= 0.4) {
        return "(D) Average";
    }
    if (score < 0.4 && score >= 0.2) {
        return "(E) Low";
    }
    if (score < 0.2 && score >= 0) {
        return "(F) Very Low";
    }
};

// Function to find N-th Harmonic Number
let nthHarmonic = function (N) {
    if (N < 1) return 0;
    // H1 = 1
    let harmonic = 1;

    // loop to apply the forumula
    // Hn = H1 + H2 + H3 ... +
    // Hn-1 + Hn-1 + 1/n
    for (let i = 2; i <= N; i++) {
        harmonic += 1 / i;
    }
    return harmonic;
};

let checkHeader = function (url) {
    return new Promise((resolve, reject) => {
        request(
            {
                method: "HEAD",
                uri: url,
                gzip: true,
                timeout: 5000,
            },
            function (err, data) {
                if (!err) {
                    return resolve(data);
                } else {
                    return reject(err);
                }
            }
        );
    });
};

let filtersUtils = function (asset, level, sourceType, includeAll) {
    if (asset.text && asset.type) {
        this.asset = asset.text || null;
        if (typeof asset.advanced === "string") {
            asset.advanced = JSON.parse(asset.advanced);
        }
        // Split by index or plain; Check search.js for more details; Useless if we are getting from assets; Valuable if getting from text_search
        this.type = asset.type.split(/_plain|_index/gi)[0];
        this.level = level || 0;
        this.year = asset.advanced.year || null;
        this.specifier = asset.advanced.specifier || null;
        this.publisher = asset.advanced.publisher || "";
        this.event = asset.advanced.event || "";
        //Always submit full name list in panel, Which will be check here
        this.team = asset.advanced.team || "";
        this.tournament = asset.advanced.tournament || "";
        this.tournament_type = asset.advanced.tournament_type || "international";

        this.ignore_list = asset.advanced.ignore ? asset.advanced.ignore.split(/\,|\|\;/gi) : [];
        this.similar_list = asset.advanced.similar ? asset.advanced.similar.split(/\,|\|\;/gi) : [];

        this.sourceType = sourceType;
        this.includeAll = includeAll == undefined ? true : includeAll;

        if (this.type.search(/live\_stream|highlight/gi) > -1) {
            let team = this.team
                .split(/\,/gi)
                .map((el) => el.trim())
                .filter((el) => el != "");
            let events = this.event
                .split(/\,/gi)
                .map((el) => el.trim())
                .filter((el) => el != "");
            let tournament = this.tournament.split(/\,\(\[\]\)/gi).filter((el) => el.trim() != "");
            let tournament_type = this.tournament_type;
            if (level === 1) {
                // Ignore common word related to live stream appear in text or path
                this.ignore_list = this.ignore_list.concat(team).concat(events).concat(publisher).concat(tournament).concat(tournament_type);
            }
            if (level === 2) {
                // Ignore publisher in pattern match
                this.ignore_list = this.ignore_list.concat(team).concat(events).concat(tournament).concat(tournament_type);
            }
        } else if (this.type.search(/web.?presence/gi) > -1) {
            let publisher = this.publisher
                .split(/(\,|\s|\n|\.|\t)/gi)
                .map((el) => el.trim())
                .filter((el) => el != "" && el.length > 3);
            this.ignore_list = _.uniq(this.ignore_list.concat(publisher));
            this.similar_list = _.uniq(this.similar_list);
        } else {
            let publisher = this.publisher
                .split(/(\,|\s|\n|\.|\t)/gi)
                .map((el) => el.trim())
                .filter((el) => el != "" && el.length > 3);
            this.ignore_list = _.uniq(this.ignore_list.concat(publisher));
            this.similar_list = _.uniq(this.similar_list.concat(publisher));
        }

        if (sourceType === sourceList.SOCIAL) {
            this.ignore_list = this.ignore_list.concat([
                "reddit",
                "twitter",
                "facebook",
                "telegram",
                "periscope",
                "pscp",
                "twitch",
                "play.google",
                "/t.me/",
            ]);
        }

        if (this.type === "video" && this.asset.search(/lecture|series|study|material|test/gi) > 0) {
            //Remove common educational words from type video:
            //TODO: Add educational category later
            this.ignore_list = this.ignore_list.concat([
                "-test-",
                "test",
                "-series-",
                "series",
                "-study-",
                "study",
                "-material-",
                "material",
                "-exam-",
                "exam",
            ]);
        }

        if (this.type === "book") {
            //Remove common educational words from type video:
            //TODO: Add educational category later
            this.ignore_list = this.ignore_list.concat([
                "-test-",
                "test",
                "-series-",
                "series",
                "-study-",
                "study",
                "-material-",
                "material",
                "-exam-",
                "exam",
            ]);
        }

        this.filters = null;
    } else {
        throw Error("INVALID_ASSET");
    }
};

filtersUtils.prototype.score_finder = function (url, text) {
    let self = this;
    // Score is meaningless in Level 2+
    if (self.level > 1) {
        return null;
    }
    if (self.type == "live_stream" || self.type == "highlights") {
        //team//0.3//event//0.1//publisher//0.2//tournament//0.4
        let team = url.search(self.sports_score_regex.team) > -1 || text.search(self.sports_score_regex.team) > -1;
        let event = url.search(self.sports_score_regex.event) > -1 || text.search(self.sports_score_regex.event) > 1;
        let publisher = url.search(self.sports_score_regex.publisher) > -1 || text.search(self.sports_score_regex.publisher) > -1;
        let tournament = url.search(self.sports_score_regex.tournament) > -1 || text.search(self.sports_score_regex.tournament) > -1;
        return 0.25 * (team ? 1 : 0) + 0.05 * (event ? 1 : 0) + 0.25 * (publisher ? 1 : 0) + 0.45 * (tournament ? 1 : 0);
    } else {
        let key_each = _.uniq(self.asset.split(/\svs?\s|\s|\,|\(|\)|\[|\]/gi));
        let key_similar = self.similar_list;
        let key_combined = [self.asset.split(" ").join("[^a-z^0-9]{0,3}")];
        let key_year = [];
        let key_publisher = [];
        let key_specifier = [];
        if ([null, undefined, ""].indexOf(self.publisher) < 0)
            key_publisher = self.publisher
                .split(/(\,|\s|\n|\.|\t)/gi)
                .map((el) => el.trim())
                .filter((el) => el != "" && el.length > 3);
        if ([null, undefined, ""].indexOf(self.year) < 0) key_year = key_year.concat(self.year);
        if ([null, undefined, ""].indexOf(self.specifier) < 0)
            key_specifier = _.uniq(key_specifier.concat(self.specifier.split(" ").join("[^a-z^0-9]{0,2}?")));
        let key_each_score = 0;
        let key_publisher_score = 0;
        let key_similar_score = 0;
        let key_combined_score = 0;
        let key_year_score = 0;
        let key_specifier_score = 0;

        let key_each_weight = 1;
        let key_publisher_weight = 1;
        let key_similar_weight = 1;
        let key_combined_weight = 1;
        let key_year_weight = 1;
        let key_specifier_weight = 1;

        key_each.forEach((k) => {
            if (url.search(new RegExp(k, "gi")) > -1 || text.search(new RegExp(k, "gi")) > -1) {
                key_each_score++;
            }
        });

        key_similar.forEach((k) => {
            if (url.search(new RegExp(k, "gi")) > -1 || text.search(new RegExp(k, "gi")) > -1) {
                key_similar_score++;
            }
        });

        key_combined.forEach((k) => {
            if (url.search(new RegExp(k, "gi")) > -1 || text.search(new RegExp(k, "gi")) > -1) {
                key_combined_score++;
            }
        });

        key_publisher.forEach((k) => {
            if (url.search(new RegExp(k, "gi")) > -1 || text.search(new RegExp(k, "gi")) > -1) {
                key_publisher_score++;
            }
        });
        key_year.forEach((k) => {
            if (url.search(new RegExp(k, "gi")) > -1 || text.search(new RegExp(k, "gi")) > -1) {
                key_year_score++;
            }
        });

        key_specifier.forEach((k) => {
            if (url.search(new RegExp(k, "gi")) > -1 || text.search(new RegExp(k, "gi")) > -1) {
                key_specifier_score++;
            }
        });

        //Required Weight
        key_each_weight = 40;
        key_combined_weight = 25;
        key_similar_weight = key_similar.length > 0 ? 20 : 0;
        key_publisher_weight = key_publisher.length > 0 ? 15 : 0;
        key_year_weight = key_year.length > 0 ? 15 : 0;
        //Advantage Weight
        key_specifier_weight = key_specifier.length && key_specifier_score > 0 ? 15 : 0;

        let score =
            (key_each.length > 0 ? (key_each_weight * nthHarmonic(key_each_score)) / nthHarmonic(key_each.length) : 0) +
            (key_combined.length > 0 ? (key_combined_weight * key_combined_score) / key_combined.length : 0) +
            (key_similar.length > 0 ? (key_similar_weight * nthHarmonic(key_similar_score)) / nthHarmonic(key_similar.length) : 0) +
            (key_publisher.length > 0 ? (key_publisher_weight * nthHarmonic(key_publisher_score)) / nthHarmonic(key_publisher.length) : 0) +
            (key_year.length > 0 ? (key_year_weight * key_year_score) / key_year.length : 0) +
            (key_specifier.length > 0 ? (key_specifier_weight * key_specifier_score) / key_specifier.length : 0);
        let total = key_each_weight + key_combined_weight + key_similar_weight + key_publisher_weight + key_year_weight;
        //if(score<20)
        //console.log('URL: ',url,'\nScore: ', score,total,'\n')
        return score / total;
    }
};

filtersUtils.prototype.build_regex = function () {
    let self = this;
    let key = _.uniq(fixAsset(self.asset.split(/\svs?\s|\s/gi).concat(self.ignore_list)));
    let filters = _.clone(keywords_primary[self.type] || keywords_primary["default"]);
    let regex = {};
    let extras = Object.keys(filters.extras);
    regex.extras = {};
    if (self.level == 1) {
        if (self.type === "live_stream" || self.type === "highlights") {
            if (key.indexOf("cricket") > -1) {
                key.push("football");
                key.push("fifa");
                key.push("session");
                key = key.concat(["schedule", "event", "premier", "career", "stats", "ranking", "league", "gdpr", "list"]);
            }
            if (key.indexOf("football") > -1) {
                key.push("cricket");
                key = key.concat(["schedule", "event", "premier", "career", "stats", "ranking", "league", "gdpr", "list"]);
            }
        }
    }
    if (self.level == 2) {
        let level_2 = _.clone(keywords_secondary[self.type] || keywords_secondary["default"]);
        filters.domain = filters.domain.concat(level_2.domain);
        filters.path = filters.path.concat(level_2.path).concat(common_level_2);
        filters.query = filters.query.concat(level_2.query).concat(common_level_2);
        filters.text = filters.text.concat(level_2.text).concat(common_level_2);
        filters.full = filters.text.concat(level_2.full);
        if (self.type === "live_stream" || self.type === "highlights") {
            //Handled by Level 2 Live Stream Regex
            //filters.path = filters.path.concat(broadcaster_list);
            //filters.query = filters.query.concat(broadcaster_list);
            //filters.text = filters.text.concat(broadcaster_list);
        }
    }
    key.forEach((k) => {
        filters.domain = filters.domain.filter((el) => k.search(new RegExp(el, "gi")) < 0);
        filters.path = filters.path.filter((el) => k.search(new RegExp(el, "gi")) < 0);
        filters.query = filters.query.filter((el) => k.search(new RegExp(el, "gi")) < 0);
        filters.text = filters.text.filter((el) => k.search(new RegExp(el, "gi")) < 0);
        filters.full = filters.full.filter((el) => k.search(new RegExp(el, "gi")) < 0);
        for (let idx = 0; idx < extras.length; idx++) {
            let el = extras[idx];
            filters.extras[el] = filters.extras[el].filter((el) => k.search(new RegExp(el, "gi")) < 0);
        }
    });
    regex.domain = new RegExp(filters.domain.join("|"), "gi");
    regex.path = new RegExp(filters.path.join("|"), "gi");
    regex.query = new RegExp(filters.query.join("|"), "gi");
    regex.text = new RegExp(filters.text.join("|"), "gi");
    regex.full = new RegExp(filters.full.join("|"), "gi");
    regex.enable = filters.enable;
    for (let idx = 0; idx < extras.length; idx++) {
        let el = extras[idx];
        regex.extras[el] = new RegExp(filters.extras[el].join("|"), "gi");
    }
    return regex;
};

filtersUtils.prototype.build_asset_filter_regex = function () {
    let self = this;
    if (self.type === "live_stream" || self.type === "highlights") {
        //let team = self.team.split(/\,/ig).map(el => el.trim());
        let events = self.event.split(/\,/gi).map((el) => el.trim());
        //let publisher = self.publisher.split(/\,/ig).map(el => el.trim());
        //let tournament = self.tournament.split(/\,\(\[\]\)/ig).filter(el => el.trim() != "");
        let tournament_type = self.tournament_type;
        let sports = Object.keys(append_asset["live_stream"]);
        let regex = {};
        let abv_remove_index = {};
        sports.forEach((sport) => {
            abv_remove_index[sport] = [];
        });
        let involved_team_name_full = [];
        let involved_team_name_abv = [];
        let full_team = _.flatten(
            sports.map((sport) =>
                append_asset["live_stream"][sport]["team"]["full"].filter((el, i) => {
                    if (self.team.search(new RegExp(el, "ig")) < 0) {
                        return true;
                    } else {
                        involved_team_name_full.push(el);
                        abv_remove_index[sport].push(i);
                        return false;
                    }
                })
            )
        ).filter((el) => el != "");
        let abv_team = _.flatten(
            sports.map((sport) =>
                append_asset["live_stream"][sport]["team"]["abv"].filter((el, i) => {
                    if (abv_remove_index[sport].indexOf(i) === -1) {
                        return true;
                    } else {
                        involved_team_name_abv.push(el);
                        return false;
                    }
                })
            )
        )
            .filter((el) => el != "")
            .map((el) => "[^a-z]" + el + "([^a-z]|$)");
        //Remove every possible match in team that can mislead result due to similar team name
        let team_data = "|" + involved_team_name_abv.concat(involved_team_name_full).concat(sports_team_exclusions).join("|") + "|";

        let team = abv_team.concat(full_team).filter((el) => {
            return team_data.search(new RegExp(el, "gi")) < 0;
        });
        regex.team = new RegExp(team.join("|"), "ig");
        regex.publisher = new RegExp(
            _.flatten(
                sports.map((sport) =>
                    append_asset["live_stream"][sport]["publisher"].filter((el, i) => self["publisher"].search(new RegExp(el, "ig")) < 0)
                )
            )
                .filter((el) => el != "")
                .map((el) => (el.length < 4 ? "[^a-z^0-9]" + el : el))
                .join("|"),
            "ig"
        );
        regex.tournament = new RegExp(
            _.flatten(
                sports.map((sport) =>
                    _.map(append_asset["live_stream"][sport]["tournament"], (el) =>
                        el
                            .filter((el, i) => self["tournament"].search(new RegExp(el, "ig")) < 0)
                            .filter((el) => el != "")
                            .join("|")
                    )
                        .filter((el) => el != "")
                        .join("|")
                )
            )
                .filter((el) => el != "")
                .join("|"),
            "ig"
        );
    }
    return regex;
};

filtersUtils.prototype.build_sports_score_regex = function () {
    let self = this;
    if (self.type === "live_stream" || self.type === "highlights") {
        //let team = self.team.split(/\,/ig).map(el => el.trim());
        let events = self.event.split(/\,/gi).map((el) => el.trim());
        //let publisher = self.publisher.split(/\,/ig).map(el => el.trim());
        //let tournament = self.tournament.split(/\,\(\[\]\)/ig).filter(el => el.trim() != "");
        let tournament_type = self.tournament_type;
        let sports = Object.keys(append_asset["live_stream"]);
        let regex = {};
        let abv_remove_index = {};
        sports.forEach((sport) => {
            abv_remove_index[sport] = [];
        });
        let full_team = _.flatten(
            sports.map((sport) =>
                append_asset["live_stream"][sport]["team"]["full"].filter((el, i) => {
                    if (self.team.search(new RegExp(el, "ig")) > -1) {
                        return true;
                    } else {
                        abv_remove_index[sport].push(i);
                        return false;
                    }
                })
            )
        )
            .filter((el) => el != "")
            .join("|");
        let abv_team = _.flatten(
            sports.map((sport) =>
                append_asset["live_stream"][sport]["team"]["abv"].filter((el, i) => {
                    return abv_remove_index[sport].indexOf(i) === -1;
                })
            )
        )
            .filter((el) => el != "")
            .join("|");
        //let abv_team
        regex.team = new RegExp(abv_team + "|" + full_team, "ig");
        regex.publisher = new RegExp(
            _.flatten(
                sports.map((sport) =>
                    append_asset["live_stream"][sport]["publisher"].filter((el, i) => self["publisher"].search(new RegExp(el, "ig")) > -1)
                )
            )
                .filter((el) => el != "")
                .map((el) => (el.length < 4 ? "[^a-z^0-9]" + el : el))
                .join("|"),
            "ig"
        );
        regex.tournament = new RegExp(
            _.flatten(
                sports.map((sport) =>
                    _.map(append_asset["live_stream"][sport]["tournament"], (el) =>
                        el
                            .filter((el, i) => self["tournament"].search(new RegExp(el, "ig")) > -1)
                            .filter((el) => el != "")
                            .join("|")
                    )
                        .filter((el) => el != "")
                        .join("|")
                )
            )
                .filter((el) => el != "")
                .join("|"),
            "ig"
        );
    }
    return regex;
};

filtersUtils.prototype.filter_level_2 = async function (url, text) {
    let self = this;
    let present = false;
    let urlInfo = urlParser.parse(url);
    if (self.type === "live_stream" || self.type === "highlights") {
        if (urlInfo.pathname.search(self.filters_2.team) > -1) {
            return {
                verdict: false,
                prediction: status.OTHER,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.LEVEL2_TEAM,
            };
        }
        if (urlInfo.pathname.search(self.filters_2.publisher) > -1) {
            return {
                verdict: false,
                prediction: status.OTHER,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.LEVEL2_PUBLISHER,
            };
        }
        if (urlInfo.pathname.search(self.filters_2.tournament) > -1) {
            return {
                verdict: false,
                prediction: status.OTHER,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.LEVEL2_TOURNAMENT,
            };
        }
    }
    if (self.asset)
        if (
            (urlInfo.pathname && urlInfo.pathname.search(needed) > -1) ||
            (urlInfo.query && urlInfo.query.search(needed) > -1) ||
            (urlInfo.path && urlInfo.path.search(date) > -1)
        ) {
            present = true;
        }
    if (!present) {
        //No Common Download keyword present; can extend this with wiki dictionary
        let contain = _.uniq(
            _.flatten(urlInfo.pathname.split(/(?=[A-Z])|[^a-z]/).map((w) => getAllSubstrings(w, 5)))
                .filter((w) => w.length > 3)
                .map((w) => w.toLowerCase())
        )
            .filter((w) => w.search(avoid) < 0)
            .filter((w) => words.check(w));
        if (contain.length === 0) {
            // Extra Checks
            // Check if length is not unusual
            if (urlInfo.pathname.length > 404) {
                return {
                    verdict: false,
                    prediction: status.OTHER,
                    score: self.score_finder(url, text),
                    rejected_by: rejected_by.LEVEL2_UNUSUAL_PATH,
                };
            }
            let html_asset_info = await filter_html_asset(url);
            // Check for header if javascript, css, plain text or image
            if (html_asset_info.verdict === true) {
                return {
                    verdict: false,
                    prediction: status.OTHER,
                    score: self.score_finder(url, text),
                    rejected_by: html_asset_info.rejected_by,
                };
            }
            return {
                verdict: true,
                prediction: status.POSSIBLE,
                score: 1,
                rejected_by: rejected_by.NONE,
            };
        }
    }
    let key = self.asset.split(/\svs?\s|\s|\,|\(|\)|\[|\]/gi).join("[^a-z^0-9]{0,2}?");
    if ((urlInfo.path && urlInfo.path.search(new RegExp(key, "gi")) > -1) || (text != "" && text.search(new RegExp(key, "gi")) > -1)) {
        return {
            verdict: true,
            prediction: status.POSSIBLE,
            score: 1,
            rejected_by: rejected_by.NONE,
        };
    }
    return {
        verdict: false,
        prediction: status.OTHER,
        score: self.score_finder(url, text),
        rejected_by: rejected_by.LEVEL2_NO_ASSET_MATCH,
    };
};

filtersUtils.prototype.filter = async function (url, text) {
    if (!url) return true;
    if (!text) text = "";
    let self = this;
    let urlInfo = urlParser.parse(url);
    if (urlInfo.protocol && (bad_protocols.indexOf(urlInfo.protocol) > -1 || urlInfo.protocol.length > 20)) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.PROTOCOL,
        };
    }
    if (urlInfo.protocol && ["http:", "https:"].indexOf(urlInfo.protocol) === -1) {
        return {
            verdict: false,
            prediction: status.NON_HTTP,
            score: 1,
            rejected_by: rejected_by.NONE,
        };
    }
    /*
    if (!url_pattern.test(url)) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.VALIDITY
        };
    }
    */
    if (!urlInfo.hostname) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.VALIDITY,
        };
    }
    if (urlInfo.hash) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.HASH,
        };
    }
    if (self.filters.enable.path_query && ((!urlInfo.pathname && !urlInfo.query) || (urlInfo.pathname === "/" && !urlInfo.query))) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.PATHNAME,
        };
    }
    if (urlInfo.hostname && urlInfo.hostname.search(self.filters.domain) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.HOST,
        };
    }
    if (urlInfo.pathname && urlInfo.pathname.search(self.filters.path) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.PATH,
        };
    }
    if ((self.type === "live_stream" || self.type === "highlights") && urlInfo.pathname.search(self.filters_2.team) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.LEVEL1_TEAM,
        };
    }
    if ((self.type === "live_stream" || self.type === "highlights") && urlInfo.pathname.search(self.filters_2.publisher) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.LEVEL1_PUBLISHER,
        };
    }
    if ((self.type === "live_stream" || self.type === "highlights") && urlInfo.pathname.search(self.filters_2.tournament) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.LEVEL1_TOURNAMENT,
        };
    }
    if (urlInfo.query && urlInfo.query.search(self.filters.query) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.QUERY,
        };
    }
    if (url.search(self.filters.full) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.FULL_URL,
        };
    }
    // Dont Perform Text Analysis in Level 2+
    if (self.level === 1 && text && text.search(self.filters.text) > -1) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.TEXT,
        };
    }
    let extras = Object.keys(self.filters.extras);
    let torrent = false;
    let ripper = false;
    let other = false;
    for (let idx = 0; idx < extras.length; idx++) {
        let el = extras[idx];
        if (url.search(self.filters.extras[el]) > -1 || (text && text.search(self.filters.extras[el]) > -1)) {
            if (["torrent"].indexOf(el) > -1) {
                torrent = true;
            }
            if (["ripper"].indexOf(el) > -1) {
                ripper = true;
            } else {
                other = true;
            }
        }
    }
    if (torrent) {
        //First Priority
        if (other) {
            return {
                verdict: true,
                prediction: status.OTHER,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.EXTRAS,
            };
        } else {
            return {
                verdict: false,
                prediction: status.P2P,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.NONE,
            };
        }
    } else if (ripper) {
        //Second Priority
        if (other) {
            return {
                verdict: true,
                prediction: status.OTHER,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.EXTRAS,
            };
        } else {
            return {
                verdict: false,
                prediction: status.RIPPER,
                score: self.score_finder(url, text),
                rejected_by: rejected_by.NONE,
            };
        }
    } else if (other) {
        return {
            verdict: true,
            prediction: status.OTHER,
            score: self.score_finder(url, text),
            rejected_by: rejected_by.EXTRAS,
        };
    }
    if (self.filters.enable.asset_check && self.level === 2) {
        let level_2_generic_analysis = await self.filter_level_2(url, text);
        if (!level_2_generic_analysis.verdict) {
            return {
                verdict: true,
                prediction: status.OTHER,
                score: self.score_finder(url, text),
                rejected_by: level_2_generic_analysis.rejected_by,
            };
        }
    }
    return {
        verdict: false,
        prediction: status.POSSIBLE,
        score: self.score_finder(url, text),
        rejected_by: rejected_by.NONE,
    };
};

filtersUtils.prototype.exractWords = function (text) {
    return _.uniq(
        text
            .split(/[^a-z^\u0900-\u097F]/gi)
            .filter((word) => word.length > 3)
            .map((word) => word.toLowerCase())
    );
};

filtersUtils.prototype.exractWordsWithDups = function (text) {
    return text
        .split(/[^a-z^\u0900-\u097F]/gi)
        .filter((word) => word.length > 3)
        .map((word) => word.toLowerCase());
};

filtersUtils.prototype.article_word_count_ratio = function (url) {
    let self = this;
    let words = self.exractWords(url.title + " " + url.description);
    return (
        nthHarmonic(self.similar_list.length - _.differenceWith(self.similar_list, words, _.isEqual).length) / nthHarmonic(self.similar_list.length)
    );
    //return (self.similar_list.length - _.differenceWith(self.similar_list, words, _.isEqual).length) / self.similar_list.length;
};

filtersUtils.prototype.title_word_count_ratio = function (url) {
    let self = this;
    let asset_words = self.exractWords(self.asset);
    let words = self.exractWords(url.title + " " + url.description);
    return nthHarmonic(asset_words.length - _.differenceWith(asset_words, words, _.isEqual).length) / nthHarmonic(asset_words.length);
    //return (asset_words.length - _.differenceWith(asset_words, words, _.isEqual).length) / asset_words.length;
};

filtersUtils.prototype.article_word_seq_match = function (url) {
    let self = this;

    let asset_seq_regex = new RegExp(self.similar_list.join(".{0,256}"), "igs");

    let sequence = self.exractWordsWithDups(url.title + " " + url.description).join(" ");
    return sequence.search(asset_seq_regex) > -1 ? 1 : 0;
};

filtersUtils.prototype.title_word_seq_match = function (url) {
    let self = this;
    let asset_seq_regex = new RegExp(self.exractWords(self.asset).join(".{0,256}"), "igs");
    let sequence = url.title + " " + url.description;

    return sequence.search(asset_seq_regex) > -1 ? 1 : 0;
};

function partition(input, spacing) {
    let output = [];

    for (let i = 0; i < input.length; i += spacing) {
        output[output.length] = input.slice(i, i + spacing);
    }

    return output;
}

filtersUtils.prototype.article_word_seq_match_partial = function (url) {
    let self = this;
    let similar_list_parts = partition(self.similar_list, 5);
    //console.log(similar_list_parts)
    let asset_seq_regex_parts = similar_list_parts.map((similar_list) => new RegExp(similar_list.join(".*"), "igs"));
    let subscore = [];
    let sequence = self.exractWordsWithDups(url.title + " " + url.description).join(" ");
    for (let j = 0; j < similar_list_parts.length; j++) {
        subscore.push(sequence.search(asset_seq_regex_parts[j]) > -1 ? 1 : 0);
    }
    let total = subscore.length;
    let count = 0;
    subscore.forEach((el) => (count += el));
    return count / total;
};

filtersUtils.prototype.article_score = function (url) {
    let self = this;
    // 1: Word Count
    // 2: Sequence Match
    // 3: Partial Sequence Match (Best of 4 out of 5 squence)

    let article_word_count_ratio_score = self.article_word_count_ratio(url);
    let article_word_seq_match_score = self.article_word_seq_match(url);
    let title_word_count_ratio_score = self.title_word_count_ratio(url);
    let title_word_seq_match_score = self.title_word_seq_match(url);
    let article_word_seq_match_partial_score = self.article_word_seq_match_partial(url);
    //__info(article_word_count_ratio_score);// used
    //__info(article_word_seq_match_score);// used
    //__info(title_word_count_ratio_score);// used
    //__info(title_word_seq_match_score);// used
    //__info(article_word_seq_match_partial_score);// used

    let total_score = 0;
    if (article_word_seq_match_score == 1 || article_word_seq_match_partial_score > 0.85) {
        total_score = 1;
    } else {
        total_score =
            article_word_seq_match_partial_score * 0.35 +
            article_word_count_ratio_score * 0.55 +
            title_word_count_ratio_score * 0.05 +
            title_word_seq_match_score * 0.05;
    }
    return total_score;
};

filtersUtils.prototype.filter_all = async function (urls) {
    let self = this;
    if (self.type == "web_presence") {
        for (let i = 0; i < urls.length; i++) {
            //__info(i);
            let obj = {};
            // When Level 2 then extract text from Page and Analyze; Otherwise in Level 1 Set basic score;
            if (self.level == 2) {
                try {
                    obj = await new Promise((resolve) => {
                        articleScanner.get_text(urls[i].source, (err, data) => {
                            if (err) {
                                __error(err);
                                return resolve({});
                            }
                            return resolve(data[0]);
                        });
                    });
                } catch (err) {
                    obj = null;
                    __error(err);
                }
                if (obj == null || obj == undefined || obj.text == undefined) {
                    __error("ADVANCE_SCAN_INCOMPLETE");
                    return [];
                }
            }
            let url = _.cloneDeep(urls[i]);
            url.description = obj && obj.text ? obj.text : url.description;
            let score = self.article_score(url);
            urls[i].prediction = score == 1 ? status.ARTICLE_COPY : status.POSSIBLE;
            urls[i].score = score;
            urls[i].rejected_by = rejected_by.NONE;
        }
        return urls;
    } else {
        self.filters = self.build_regex();
        if (self.type === "live_stream" || self.type === "highlights") {
            self.sports_score_regex = self.build_sports_score_regex();
            self.filters_2 = self.build_asset_filter_regex();
        }

        let filtered = [];
        for (let i = 0; i < urls.length; i++) {
            let el = urls[i];
            let source = fixURL(el.source);
            // Include description in text when live_stream
            let text =
                (el.title ? el.title : "") +
                " " +
                ((self.type === "live_stream" || self.type === "highlights") && el.description ? el.description : "") +
                " " +
                (el.name ? el.name : "");
            // Handle Level 1 social Result with Non-URL Source
            let analysis;
            if (self.sourceType === sourceList.SOCIAL || self.sourceType === sourceList.TORRENT) {
                analysis = await self.filter(valid_source, text);
            } else {
                analysis = await self.filter(source, text);
            }
            el.source = source;
            el.score = analysis.score;
            el.prediction = analysis.prediction;
            el.rejected_by = analysis.rejected_by;
            if (!analysis.verdict || self.includeAll) {
                //This will filter out useless urls
                filtered.push(el);
            }
        }
        return filtered;
    }
};

filtersUtils.prototype.filter_urls = async function (urls) {
    let self = this;
    self.filters = self.build_regex();
    if (self.level === 2) {
        //if (self.type === 'live_stream'||self.type === 'highlights') {
        //    self.filters_2 = self.build_asset_filter_regex();
        //}
    }
    if (self.type === "live_stream" || self.type === "highlights") {
        self.sports_score_regex = self.build_sports_score_regex();
        // For Path removal on level 1; Level 2 also needed
        self.filters_2 = self.build_asset_filter_regex();
    }
    let filtered = [];
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let source = fixURL(url);
        let analysis = await self.filter(source, "");
        if (!analysis.verdict || self.includeAll) {
            //This will filter out useless urls
            filtered.push(source);
        }
    }
    return filtered;
};

export default filtersUtils;
