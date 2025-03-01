var fetch = require('./fetch');


var result = '';
var asset = '';
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const encrypted_pass_prod = process.env.database_password_prod;
const encrypted_pass_dev = process.env.database_password_dev;


exports.handler = async (event, context, callback) => {
    let decrypted;
    if (!event.queryStringParameters ) {
        return callback(null, { state: 'KEYWORD_MISSING', results: [] });
    }
    

    if (event.queryStringParameters.engine == "pdf") {
        let results = {};
        
        return callback(null, results);
    }

    if (event.queryStringParameters.engine == "google" && event.queryStringParameters.key.search(/^https?(:|%3A)/ig) > -1) {
        event.queryStringParameters.engine = "google_search_by_image";
    }
    var date_init = event.queryStringParameters.date_init ;
    var date_final = event.queryStringParameters.date_final ;
    const crawler_list = event.queryStringParameters.crawler_list ;
            if (event.queryStringParameters.env == 'dev')
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
         else if (event.queryStringParameters.env == 'prod')
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
   
    await fetch.fetch( date_init, date_final ,crawler_list, event.queryStringParameters.env, decrypted,function(err,results){
    if (err)
      throw err;
    result = results
    console.log("asset",result);
        
    })
   result = JSON.stringify(result);
   const S3  = new AWS.S3();
   S3.putObject( {
         Bucket: 'credentials-db-new',
         Key: 'data-digital-piracy-scan/ecom-data.json',
         Body: `${result}`
    } )
         .promise()
         .then( () => console.log( 'UPLOAD SUCCESS' ) )
         .then( () => callback( null, 'SUCCESS' ) )
         .catch( e => {
            console.error( 'ERROR', e );
            callback( e );
         } );


    return callback(null, {"result" :"s"});


}