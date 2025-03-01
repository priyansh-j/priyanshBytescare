const chromium = require('chrome-aws-lambda');
const engine = require("./engines");
const fs = require("fs");
var path = require('path');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const encrypted_pass_prod = process.env.database_password_prod;
const encrypted_pass_dev = process.env.database_password_dev;


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
    let decrypted;

    let bucket = event.bucket;
    let bucket_path = event.bucket_path;
    let aid = bucket_path.split("/")[2]
    let tid = bucket_path.split("/")[4]
    console.log("aid",aid);
    //process.exit();
    


        if (event.env == 'dev')
         {
             
                if (!decrypted) {
                // Decrypt code should run once and variables stored outside of the
                // function handler so that these are decrypted once per container
                const kms = new AWS.KMS();
                try {
                    const req = {
                        CiphertextBlob: Buffer.from(process.env.database_password_dev, 'base64'),
                        EncryptionContext: { LambdaFunctionName: functionName },
                    };
                    const data = await kms.decrypt(req).promise();
                    decrypted = data.Plaintext.toString('ascii');
                } catch (err) {
                    console.log('Decrypt error:', err);
                    throw err;
                }
          }
         } 
         else if (event.env == 'prod')
         {
             
                if (!decrypted) {
                // Decrypt code should run once and variables stored outside of the
                // function handler so that these are decrypted once per container
                const kms = new AWS.KMS();
                try {
                    const req = {
                        CiphertextBlob: Buffer.from(process.env.database_password_prod, 'base64'),
                        EncryptionContext: { LambdaFunctionName: functionName },
                    };
                    const data = await kms.decrypt(req).promise();
                    decrypted = data.Plaintext.toString('ascii');
                } catch (err) {
                    console.log('Decrypt error:', err);
                    throw err;
                }
          }
         } 
        
       let  result = await engine.extract( bucket_path, aid, event.env,decrypted,tid);


    
    
    return callback(null, result);

};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Site: https://freeeducationweb.com/
function detectNetworkBlocker(title) {
    if (title.search(/Just a moment/igs) > -1) {
        return true;
    }
    return false;
}


