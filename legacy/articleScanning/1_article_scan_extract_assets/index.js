/******************************************************************************************************************************
#   --------------------------------------------Modification logs------------------------------------------------------------
#
#   Developer Name                          Date                                Description
#----------------------------------------------------------------------------------------------------------------------------
#   Saksham Madan                           06-11-2023                          Initial Version
******************************************************************************************************************************/
/* This function is used to extract the text to be searched for the assets for all the different time intervals */

var fetch = require("./fetch");
var result = "";
const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

exports.handler = async (event, context, callback) => {
  let decrypted;
  if (!event.queryStringParameters) {
    return callback(null, { state: "KEYWORD_MISSING", results: [] });
  }

  if (event.queryStringParameters.engine == "pdf") {
    let results = {};

    return callback(null, results);
  }

  if (
    event.queryStringParameters.engine == "google" &&
    event.queryStringParameters.key.search(/^https?(:|%3A)/gi) > -1
  ) {
    event.queryStringParameters.engine = "google_search_by_image";
  }
  
  const invocation_time = event.queryStringParameters.invocation_time;
  
  //Decrypt the test database key, if invocation environment is dev
  if (event.queryStringParameters.env == "dev") {
    if (!decrypted) {
      // Decrypt code should run once and variables stored outside of the
      // function handler so that these are decrypted once per container
      const kms = new AWS.KMS();
      try {
        const req = {
          CiphertextBlob: Buffer.from(
            process.env.database_password_dev,
            "base64"
          ),
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
  
  //Decrypt the prod database key, if invocation environment is prod
  else if (event.queryStringParameters.env == "prod") {
    if (!decrypted) {
      // Decrypt code should run once and variables stored outside of the
      // function handler so that these are decrypted once per container
      const kms = new AWS.KMS();
      try {
        const req = {
          CiphertextBlob: Buffer.from(
            process.env.database_password_prod,
            "base64"
          ),
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
  await fetch.fetch(
    invocation_time,
    event.queryStringParameters.env,
    decrypted,
    function (err, results) {
      if (err) throw err;
      result = results;
      //console.log("asset", result);
    }
  );
  result = JSON.stringify(result);
  const S3 = new AWS.S3();
  const bucket = "credentials-db-new";
  const Key = `article-scan/common_scan/data.json`;
  S3.putObject({
    Bucket: bucket,
    Key: Key,
    Body: `${result}`,
  })
    .promise()
    .then(() => console.log("UPLOAD SUCCESS"))
    .then(() => callback(null, "SUCCESS"))
    .catch((e) => {
      console.error("ERROR", e);
      callback(e);
    });

  return callback(null, { path: Key, bucket: bucket });
};
