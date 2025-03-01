
async function fetch(pid,env,decrypted,callback){
 if (env == 'dev')
 {
    
    let mysql = require('serverless-mysql')({
    config: {
    host: process.env.db_host_dev,
    user: process.env.database_username_dev,
    password: decrypted,
    database : process.env.database,
    requestTimeout: 180000
         }
    })
  let results = await mysql.query("select * from asset where pid = ? ;", [pid])

  // Run clean up function
  await mysql.end()
  mysql.quit()

  // Return the results
  return callback(null,results)
     
 }

 else if (env == 'prod')
 {
    let mysql = require('serverless-mysql')({
    config: {
    host: process.env.db_host_prod,
    user: process.env.database_username_prod,
    password: decrypted,
    database : process.env.database,
    requestTimeout: 180000
         }
    })
  let results = await mysql.query("select * from asset where pid = ? ;", [pid])

  // Run clean up function
  await mysql.end()
  mysql.quit()
  return callback(null,results)
 }
 
 else {
     
    
    let mysql = require('serverless-mysql')({
    config: {
    host: process.env.db_host_dev,
    user: process.env.database_username_dev,
    password: decrypted,
    database : process.env.database,
    requestTimeout: 180000
         }
    })
  let results = await mysql.query("select * from asset where pid = ? ;", [pid])

  // Run clean up function
  await mysql.end()
  mysql.quit()

  // Return the results
  return callback(null,results)
     
     
     
 }

} 

module.exports = {
   fetch : fetch
};