const chromium = require("chrome-aws-lambda");
const fs = require("fs");
var path = require("path");
const AWS = require("aws-sdk");
const request = require("request");
AWS.config.update({ region: "ap-south-1" });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const encrypted_pass_prod = process.env.database_password_prod;
const encrypted_pass_dev = process.env.database_password_dev;

const engines = require("./engines");

String.prototype.hashCode = function () {
    var hash = 0,
        i,
        chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

exports.handler = async (event, context, callback) => {
    let decrypted;
    if (!event.queryStringParameters || !event.queryStringParameters.key || !event.queryStringParameters.engine) {
        return callback(null, { state: "KEYWORD_MISSING", results: [] });
    }
    event.queryStringParameters.engine = event.queryStringParameters.engine.toLowerCase().trim();
    // event.queryStringParameters.key = event.queryStringParameters.key.toLowerCase().trim();

    // if (!event.queryStringParameters || !event.queryStringParameters.engine || Object.keys(engines).indexOf(event.queryStringParameters.engine) < 0) {
    //     return callback(null, { state: 'ENGINE_MISSING', results: [] });
    // }

    /* if (event.queryStringParameters.engine == "google" && event.queryStringParameters.key.search(/^https?(:|%3A)/ig) > -1) {
        event.queryStringParameters.engine = "google_search_by_image";
    }*/
    let result = null;
    let browser = null;

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        if (event.queryStringParameters.env == "dev") {
            if (!decrypted) {
                // Decrypt code should run once and variables stored outside of the
                // function handler so that these are decrypted once per container
                const kms = new AWS.KMS();
                try {
                    const req = {
                        CiphertextBlob: Buffer.from(process.env.database_password_dev, "base64"),
                        EncryptionContext: { LambdaFunctionName: functionName },
                    };
                    const data = await kms.decrypt(req).promise();
                    decrypted = data.Plaintext.toString("ascii");
                } catch (err) {
                    console.log("Decrypt error:", err);
                    throw err;
                }
            }
        } else if (event.queryStringParameters.env == "prod") {
            if (!decrypted) {
                // Decrypt code should run once and variables stored outside of the
                // function handler so that these are decrypted once per container
                const kms = new AWS.KMS();
                try {
                    const req = {
                        CiphertextBlob: Buffer.from(process.env.database_password_prod, "base64"),
                        EncryptionContext: { LambdaFunctionName: functionName },
                    };
                    const data = await kms.decrypt(req).promise();
                    decrypted = data.Plaintext.toString("ascii");
                } catch (err) {
                    console.log("Decrypt error:", err);
                    throw err;
                }
            }
        }

        if (event.queryStringParameters.engine == "google") {
            let engine = engines[event.queryStringParameters.engine];
            let key = event.queryStringParameters.key;
            console.log("google here");
            let url = `https://www.google.com/search?q=${encodeURIComponent(key)}&num=1000`;
            const proxies = {
                http: "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000",
                https: "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000",
            };
            const options = {
                url: url,
                method: "GET",
                proxies: proxies,
                headers: {
                    Accept: "application/json",
                    "Accept-Charset": "utf-8",
                    "User-Agent": "Mozilla/5.0",
                },
                timeout: 10000,
            };

            let result_page = await new Promise((resolve, reject) => {
                request(options, function (err, res, body) {
                    if (err) return reject(err);
                    return resolve(body);
                });
            });
            result = await engine.extract(
                result_page,
                event.queryStringParameters.accurate,
                event.queryStringParameters.page,
                event.queryStringParameters.aid,
                event.queryStringParameters.engine,
                event.queryStringParameters.env,
                decrypted,
                event.queryStringParameters.tid
            );
        } else if (event.queryStringParameters.engine == "scribd") {
            let page = await browser.newPage();

            let engine = engines[event.queryStringParameters.engine];
            console.log(engine);
            console.log("scribd here");

            let url = engine.searchURL(event.queryStringParameters.key);

            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
            await page.waitForSelector("ul._1kBhLK._3S_oce._1gyGKg._3MyJWQ._3qn-sP._3NAnxI._2q7Jiq._3MqOhW", { visible: true });
            let source = await page.content();
            result = await engine.extract(
                source,
                event.queryStringParameters.accurate,
                event.queryStringParameters.page,
                event.queryStringParameters.aid,
                event.queryStringParameters.engine,
                event.queryStringParameters.env,
                decrypted,
                event.queryStringParameters.tid
            );
        } else {
            let page = await browser.newPage();

            let engine = engines[event.queryStringParameters.engine];
            console.log(engine);

            let url = engine.searchURL(event.queryStringParameters.key);

            await page.goto(url);

            let source = await page.content();
            result = await engine.extract(
                source,
                event.queryStringParameters.accurate,
                event.queryStringParameters.page,
                event.queryStringParameters.aid,
                event.queryStringParameters.engine,
                event.queryStringParameters.env,
                decrypted,
                event.queryStringParameters.tid
            );
        }
    } catch (error) {
        return callback(error);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    return callback(null, result);
    //return callback(null, {
    //statusCode: 200,
    //body: JSON.stringify(result),
    //headers: {'Content-Type': 'application/json'}
    //});
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test Site: https://freeeducationweb.com/
function detectNetworkBlocker(title) {
    if (title.search(/Just a moment/gis) > -1) {
        return true;
    }
    return false;
}
